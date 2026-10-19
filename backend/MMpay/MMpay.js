require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { MMPaySDK } = require("mmpay-node-sdk");
const Order = require("../models/Order");

const router = express.Router();

// 1. Initialize the SDK with your sandbox credentials
const MMPay = new MMPaySDK({
    appId: process.env.MMPAY_APP_ID,
    publishableKey: process.env.MMPAY_PUBLISHABLE_KEY,
    secretKey: process.env.MMPAY_SECRET_KEY,
    apiBaseUrl: process.env.MMPAY_BASE_URL,
});

// Attach error handler to prevent unhandled EventEmitter errors
MMPay.on("error", (err) => {
    console.error("MMPay SDK error:", err.message);
});

// 2. Endpoint to create an order (fake or sandbox)
router.post(["/orders/mmpay-create", "/mmpay/checkout", "/mmpay/fake-checkout"], async (req, res) => {
    try {
        const { amount, orderId, items, shippingAddress, paymentMethod, vendor } = req.body;
        const selectedVendor = vendor || paymentMethod || "KBZPay";
        const generatedOrderId = orderId || `ORD_${Date.now()}`;
        const totalAmount = amount || 25000;
        const transactionRefId = `TX_${Date.now()}`;

        let payResponse;
        try {
            // Call MyanMyanPay sandbox API to generate the MMQR payment order
            payResponse = await MMPay.pay({
                orderId: generatedOrderId,
                amount: totalAmount,
                items: items || [{ name: "Fashion Dress", price: totalAmount, quantity: 1 }],
                customMessage: "Fashion Store Checkout",
            });
            if (payResponse instanceof Error || (payResponse && payResponse.error)) {
                throw payResponse;
            }
        } catch (apiError) {
            console.warn("MyanMyanPay API sandbox unreachable, generating fake sandbox checkout order:", apiError?.message || apiError);
            // Fallback: return fake MyanMyanPay sandbox checkout order response
            payResponse = {
                orderId: generatedOrderId,
                amount: totalAmount,
                currency: "MMK",
                status: "PENDING",
                vendor: selectedVendor,
                vendorQrRefId: `VQR_${selectedVendor}_${Date.now()}`,
                transactionRefId: transactionRefId,
                qr: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="white"/><text x="10" y="50" font-family="monospace" font-size="12" fill="black">${selectedVendor} MMQR</text><text x="10" y="100" font-family="monospace" font-size="10" fill="gray">${generatedOrderId}</text><text x="10" y="150" font-family="monospace" font-size="12" fill="black">${totalAmount} MMK</text></svg>`,
                url: `https://sandbox.myanmyanpay.com/checkout?order_id=${generatedOrderId}&amount=${totalAmount}&vendor=${selectedVendor}`,
                fakeSandbox: true,
                paymentMethod: selectedVendor,
                shippingAddress: shippingAddress || null
            };
        }

        // Persist order in MongoDB with Pending status while payment is awaited
        try {
            let userId = null;
            const authHeader = req.headers["authorization"];
            if (authHeader && authHeader.startsWith("Bearer ")) {
                const token = authHeader.split(" ")[1];
                const jwt = require("jsonwebtoken");
                const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
                userId = decoded.userId;
            }

            if (userId && items && items.length > 0) {
                await Order.findOneAndUpdate(
                    { orderNumber: generatedOrderId },
                    {
                        $setOnInsert: {
                            user: userId,
                            orderNumber: generatedOrderId,
                            items: items.map(item => ({
                                product: mongoose.isValidObjectId(item.productId || item._id) ? (item.productId || item._id) : new mongoose.Types.ObjectId(),
                                title: item.name || item.title || "Fashion Item",
                                quantity: item.quantity || 1,
                                price: item.price || totalAmount,
                                size: item.size || "M",
                                color: item.color || "Black"
                            })),
                            subtotal: totalAmount,
                            shippingFee: 0,
                            totalAmount: totalAmount,
                            shippingAddress: {
                                name: shippingAddress?.name || "Customer",
                                phone: shippingAddress?.phone || "0912345678",
                                address: shippingAddress?.address || "Yangon, Myanmar",
                                township: shippingAddress?.township || "Kamayut",
                                city: shippingAddress?.city || "Yangon"
                            },
                        },
                        $set: {
                            paymentMethod: selectedVendor || paymentMethod || "MyanMyanPay",
                            paymentStatus: "Pending",
                            orderStatus: "Pending",
                            "paymentDetails.transactionId": transactionRefId
                        }
                    },
                    { upsert: true, new: true }
                );
                console.log(`Order ${generatedOrderId} saved to MongoDB as Pending.`);
            }
        } catch (dbErr) {
            console.warn("Could not persist order to DB in checkout (continuing):", dbErr.message);
        }

        // Returns orderId and QR details to frontend
        res.status(200).json(payResponse);
    } catch (error) {
        console.error("Order creation failed:", error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Webhook endpoint (Matches your ngrok path)
router.post("/webhooks/mmpay-callback-sandbox", async (req, res) => {
    try {
        // Use raw request buffer config to handle signatures safely
        const rawBuffer = req.rawBody || (Buffer.isBuffer(req.body) ? req.body : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body)));
        const payload = rawBuffer.toString("utf8");
        const nonce = req.headers["x-mmpay-nonce"];
        const signature = req.headers["x-mmpay-signature"];

        // Cryptographically verify that the payload came from MyanMyanPay
        const isValid = await MMPay.verifyCb(payload, nonce, signature);
        if (!isValid) {
            console.error("Webhook signature verification failed.");
            return res.status(400).send("Signature verification failed");
        }

        await MMPay.listen(payload, nonce, signature);

        // Resolve body object (either from parsed req.body or raw JSON string)
        const body = (typeof req.body === 'object' && !Buffer.isBuffer(req.body) && req.body !== null)
            ? req.body
            : JSON.parse(payload || '{}');

        console.log("Verified Webhook Payload:", body);

        // Read the event details
        const { orderId, status, transactionRefId } = body;

        if (status === "SUCCESS") {
            console.log(`Payment confirmed for Order ${orderId}. TxRef: ${transactionRefId}`);

            // Update MongoDB Order model paymentStatus to 'PAID'
            const updateFilter = mongoose.isValidObjectId(orderId)
                ? { _id: orderId }
                : { $or: [{ orderNumber: orderId }, { "paymentDetails.transactionId": orderId }] };

            const updatedOrder = await Order.findOneAndUpdate(
                updateFilter,
                {
                    $set: {
                        paymentStatus: "PAID",
                        orderStatus: "Confirmed",
                        "paymentDetails.transactionId": transactionRefId || (mongoose.isValidObjectId(orderId) ? null : orderId),
                        "paymentDetails.paidAt": new Date(),
                        "paymentDetails.rawWebhookPayload": body,
                    }
                },
                { returnDocument: 'after' }
            );

            if (!updatedOrder) {
                console.warn(`Order ${orderId} not found in database to update.`);
            } else {
                console.log(`Order ${orderId} status successfully updated to PAID in MongoDB.`);
            }
        } else if (status === "FAILED") {
            console.log(`Payment failed for Order ${orderId}: ${status}`);
            const updateFilter = mongoose.isValidObjectId(orderId)
                ? { _id: orderId }
                : { "paymentDetails.transactionId": orderId };

            await Order.findOneAndUpdate(updateFilter, { $set: { paymentStatus: "Failed" } });
        } else {
            console.log(`Payment status for Order ${orderId}: ${status}`);
        }

        // Always return HTTP 200 immediately
        res.status(200).json({ received: true });
    } catch (error) {
        console.error("Webhook signature verification failed:", error);
        res.status(400).send("Signature verification failed");
    }
});

// Standalone execution support if invoked directly
if (require.main === module) {
    const standaloneApp = express();
    standaloneApp.use(express.json({
        verify: (req, res, buf) => {
            req.rawBody = buf;
        }
    }));
    standaloneApp.use("/", router);
    const PORT = process.env.MMPAY_PORT || 3001;
    standaloneApp.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = router;