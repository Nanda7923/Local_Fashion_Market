let orderService = require('./../services/orderService');
const resError = require('./../middlewares/resError');

function getStatusCode(err) {
    if (err && typeof err.statusCode === 'number') {
        return err.statusCode;
    }
    if (err && (err.name === 'ValidationError' || err.name === 'CastError')) {
        return 400;
    }
    return 500;
}

async function createOrder (req, res)  {
    try {
        const userId = req.user.userId;
        const result = await orderService.createOrder(userId, req.body);

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            data: result
        });
    } catch (err) {
        return resError(res, err, getStatusCode(err));
    }
}

async function cancelOrder(req , res){
    try{
        const { orderId } = req.params;
        const userId = req.user.userId;

        const cancelledOrder = await orderService.cancelOrder(orderId, userId);

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            data: cancelledOrder
        });
    }catch(err){
        return resError(res, err, getStatusCode(err));
    }
}

async function getOrderById(req , res){
    try{
        const { orderId } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const order = await orderService.getOrderById(orderId, userId, userRole);

        return res.status(200).json({
            success: true,
            data: order
        });
    }catch(err){
        return resError(res, err, getStatusCode(err));
    }
}

async function getMyOrders(req,res){
    try{
        const userId = req.user.userId;
        const orders = await orderService.getMyOrders(userId);

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    }catch(err){
        return resError(res, err, getStatusCode(err));
    }
}

async function  updateOrderStatus(req , res){
    try{
        const { orderId } = req.params;
        const { orderStatus } = req.body;

        const updatedOrder = await orderService.updateOrderStatus(orderId, orderStatus);

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: updatedOrder
        });
    }catch(err){
        return resError(res, err, getStatusCode(err));
    }
}

async function getAllOrders(req,res){
    try{
        const orders = await orderService.getAllOrders();

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    }catch(err){
        return resError(res, err, getStatusCode(err));
    }
}

module.exports = {
    createOrder,
    cancelOrder,
    getOrderById,
    getMyOrders,
    updateOrderStatus,
    getAllOrders,
}