const User = require('./../models/User');
const Product = require('./../models/Product');
const Review = require('./../models/Review');
const Order = require('./../models/Order');

async function getAdminDashboardOverView(){
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const reviews = await Review.countDocuments();
    const orders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({orderStatus : "Pending"});
    const confirmedOrders = await Order.countDocuments({orderStatus : "Confirmed"});
    const processingOrders = await Order.countDocuments({orderStatus : "Processing"});
    const shippedOrders = await Order.countDocuments({orderStatus : "Shipped"});
    const deliveredOrders = await Order.countDocuments({orderStatus : "Delivered"});
    const cancelledOrders = await Order.countDocuments({orderStatus : "Cancelled"});
    return {
        totalUsers,
        totalProducts,
        reviews,
        orders,
        pendingOrders,
        confirmedOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
    }
};

module.exports= {
    getAdminDashboardOverView,
}