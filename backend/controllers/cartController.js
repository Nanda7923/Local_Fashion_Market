const CartService = require('../services/cartService');
const resError = require('../middlewares/resError');

function logControllerEntry(req, res, action) {
    console.info(`[CART_DIAG] request=${req.requestId} controller=${action} entered`);
    res.once('finish', () => {
        console.info(`[CART_DIAG] request=${req.requestId} controller=${action} response_complete status=${res.statusCode}`);
    });
}

function handleError(req, res, error) {
    const statusCode = error.statusCode || 500;
    console.error(`[CART_DIAG] request=${req.requestId} controller=response_error status=${statusCode} error=${error.name || 'Error'}`);
    return resError(res, error, statusCode);
}

async function getCartByUserId(req, res) {
    logControllerEntry(req, res, 'getCartByUserId');
    try {
        const cart = await CartService.getCartByUserId(req.user.userId, req.requestId);
        console.info(`[CART_DIAG] request=${req.requestId} controller=response_success status=200`);
        return res.json({ message: 'Success', data: cart });
    } catch (error) {
        return handleError(req, res, error);
    }
}

async function addToCart(req, res) {
    logControllerEntry(req, res, 'addToCart');
    try {
        const { productId, quantity, size, color } = req.body;
        const cart = await CartService.addToCart(
            req.user.userId, productId, quantity, size, color, req.requestId
        );
        console.info(`[CART_DIAG] request=${req.requestId} controller=response_success status=200`);
        return res.status(200).json({ message: 'Successfully added to cart', data: cart });
    } catch (error) {
        return handleError(req, res, error);
    }
}

async function updateQuantity(req, res) {
    logControllerEntry(req, res, 'updateQuantity');
    try {
        const cart = await CartService.updateQuantity(
            req.user.userId, req.params.itemId, req.body.quantity, req.requestId
        );
        console.info(`[CART_DIAG] request=${req.requestId} controller=response_success status=200`);
        return res.json({ message: 'Successfully updated cart item', data: cart });
    } catch (error) {
        return handleError(req, res, error);
    }
}

async function removeProductFromCart(req, res) {
    logControllerEntry(req, res, 'removeProductFromCart');
    try {
        const cart = await CartService.removeProductFromCart(
            req.user.userId, req.params.itemId, req.requestId
        );
        console.info(`[CART_DIAG] request=${req.requestId} controller=response_success status=200`);
        return res.json({ message: 'Successfully removed cart item', data: cart });
    } catch (error) {
        return handleError(req, res, error);
    }
}

async function removeAllProducts(req, res) {
    logControllerEntry(req, res, 'removeAllProducts');
    try {
        const cart = await CartService.removeAllProducts(req.user.userId, req.requestId);
        console.info(`[CART_DIAG] request=${req.requestId} controller=response_success status=200`);
        return res.json({ message: 'Successfully emptied cart', data: cart });
    } catch (error) {
        return handleError(req, res, error);
    }
}

module.exports = {
    getCartByUserId,
    addToCart,
    updateQuantity,
    removeProductFromCart,
    removeAllProducts,
};
