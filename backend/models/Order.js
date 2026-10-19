const mongoose = require("mongoose");
const { Schema } = mongoose;

const OrderSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        orderNumber: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                title: {
                    type: String,
                    required: true // Snapshot in case product name changes later
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0
                },
                size: {
                    type: String,
                    enum: ["S", "M", "L", "XL", "2XL"],
                    required: true
                },
                color: {
                    type: String,
                    required: true
                }
            }
        ],
        subtotal: {
            type: Number,
            required: true,
            min: 0
        },
        shippingFee: {
            type: Number,
            default: 0,
            min: 0
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        shippingAddress: {
            name: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
            township: { type: String, required: true },
            city: { type: String, required: true },
            note: { type: String }
        },
        paymentMethod: {
            type: String,
            enum: ["COD", "KBZPay", "WavePay", "AYAPay","MyanMyanPay"],
            required: true
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "PAID", "Failed", "Refunded"],
            default: "Pending",
            index: true
        },
        // Tracks the external payment session and callback responses
        paymentDetails: {
            transactionId: { type: String, default: null, index: true }, // Gateway trans ID
            paidAt: { type: Date, default: null },
            rawWebhookPayload: { type: Schema.Types.Mixed, select: false } // Kept for debugging/audit
        },
        orderStatus: {
            type: String,
            enum: [
                "Pending",
                "Confirmed",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled"
            ],
            default: "Pending",
            index: true
        }
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;