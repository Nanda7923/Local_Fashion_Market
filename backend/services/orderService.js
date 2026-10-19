const mongoose = require('mongoose');
const Order = require('./../models/Order');
const Product = require('./../models/Product');

async function createOrder (userId, { cartItems, shippingAddress, paymentMethod }) {

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        const error = new Error("Cart is empty");
        error.statusCode = 400;
        throw error;
    }

    if (!shippingAddress || !shippingAddress.city || !shippingAddress.phone || !shippingAddress.address) {
        const error = new Error("Shipping address details are incomplete");
        error.statusCode = 400;
        throw error;
    }

    const validPaymentMethods = ["COD", "KBZPay", "WavePay", "AYAPay","MyanMyanPay"];
    if (!validPaymentMethods.includes(paymentMethod)) {
        const error = new Error("Invalid payment method selected");
        error.statusCode = 400;
        throw error;
    }

    const productIds = cartItems.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    let subtotal = 0;
    const orderItems = [];

    for (const item of cartItems) {
        const quantity = Number(item.quantity);
        if (!quantity || quantity <= 0) {
            const error = new Error("Item quantity must be at least 1");
            error.statusCode = 400;
            throw error;
        }

        const product = products.find(p => p._id.toString() === item.productId.toString());
        if (!product) {
            const error = new Error(`Product not found: ${item.productId}`);
            error.statusCode = 404;
            throw error;
        }

        if (!product.inStock) {
            const error = new Error(`Product "${product.title}" is out of stock`);
            error.statusCode = 400;
            throw error;
        }

        if (!product.size.includes(item.size)) {
            const error = new Error(`Size "${item.size}" is unavailable for "${product.title}"`);
            error.statusCode = 400;
            throw error;
        }

        const hasColor = product.color.some(
            c => c.trim().toLowerCase() === item.color?.trim().toLowerCase()
        );
        if (!hasColor) {
            const error = new Error(`Color "${item.color}" is unavailable for "${product.title}"`);
            error.statusCode = 400;
            throw error;
        }

        subtotal += product.price * quantity;
        orderItems.push({
            product: product._id,
            title : product.title,
            quantity: quantity,
            price: product.price,
            size: item.size,
            color: item.color
        });
    }

    const isYangon = shippingAddress.city.trim().toLowerCase() === 'yangon';
    const shippingFee = isYangon ? 2500 : 4500;
    const totalAmount = subtotal + shippingFee;

    const orderNumber = `ORD_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const normalizedShippingAddress = {
        name: shippingAddress.name?.trim() || "Customer",
        phone: shippingAddress.phone.trim(),
        address: shippingAddress.address.trim(),
        township: shippingAddress.township?.trim() || (isYangon ? "Kamayut" : shippingAddress.city.trim()),
        city: shippingAddress.city.trim(),
        note: shippingAddress.note || ""
    };

    const order = await Order.create({
        user: userId,
        orderNumber,
        items: orderItems,
        subtotal,
        shippingFee,
        totalAmount,
        shippingAddress: normalizedShippingAddress,
        paymentMethod,
        paymentStatus: 'Pending',
        orderStatus: paymentMethod === 'COD' ? 'Confirmed' : 'Pending'
    });

    if (paymentMethod === 'COD') {
        return { order, paymentUrl: null };
    }

    const baseUrl = process.env.MMPAY_BASE_URL;
    const paymentUrl = `${baseUrl}/checkout?order_id=${order._id}&amount=${totalAmount}`;

    return { order, paymentUrl };
};


async function cancelOrder(orderId, userId){
    if (!mongoose.isValidObjectId(orderId)) {
        const error = new Error("Order not found!");
        error.statusCode = 404;
        throw error;
    }
    const order = await Order.findById(orderId);
    if (!order) {
        const error = new Error("Order not found!");
        error.statusCode = 404;
        throw error;
    }
    if (order.user.toString() !== userId.toString()) {
        const error = new Error("You are not authorized to cancel this order");
        error.statusCode = 403;
        throw error;
    }
    if (order.orderStatus === "Cancelled") {
        const error = new Error("Order is already cancelled and cannot be cancelled again");
        error.statusCode = 400;
        throw error;
    }
    if (order.orderStatus !== "Pending") {
        const error = new Error(`Only pending orders can be cancelled. Current status is ${order.orderStatus}`);
        error.statusCode = 400;
        throw error;
    }
    order.orderStatus = "Cancelled";
    return order.save();
}

async function getOrderById(orderId, userId, userRole){
    const query = { _id: orderId };
    if (userRole !== 'Admin') {
        query.user = userId;
    }

    const order = await Order.findOne(query)
        .populate('items.product', 'title imageUrl price')
        .lean();

    if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
    }
    return order;
}

async function getMyOrders(userId){
	let orders = await Order.find({ user: userId })
                            .populate('items.product', 'title imageUrl price')
                            .sort({ createdAt: -1 })
                            .lean();
    return orders;
}

async function updateOrderStatus( orderId, orderStatus){
    let order = await Order.findById(orderId);
    if(!order){
        throw new Error("Order not found!");
    }
        order.orderStatus = orderStatus;
        await order.save();
        return order;
}

async function getAllOrders(){
	let orders = await Order.find().populate('user', 'name email').populate('items.product', 'title imageUrl').sort({ createdAt: -1 });
    if(!orders){
        throw new Error("Order not found!");
    }
    return orders;
}

module.exports = {
    createOrder,
    cancelOrder,
    getOrderById,
    getMyOrders,
    updateOrderStatus,
    getAllOrders,
}
