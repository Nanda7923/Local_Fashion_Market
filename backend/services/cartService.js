const Cart = require('../models/Cart');
const Product = require('../models/Product');

const cartPopulate = {
    path: 'items.product',
    select: 'title brand category price size color imageUrl inStock',
    populate: { path: 'brand', select: 'name' },
};

function diagnosticLog(requestId, message) {
    console.info(`[CART_DIAG] request=${requestId || 'unknown'} ${message}`);
}

async function traceDatabaseOperation(requestId, operation, run) {
    diagnosticLog(requestId, `database=${operation} start`);
    try {
        const result = await run();
        diagnosticLog(requestId, `database=${operation} complete`);
        return result;
    } catch (error) {
        console.error(`[CART_DIAG] request=${requestId || 'unknown'} database=${operation} failed error=${error.name || 'Error'} code=${error.code || 'none'}`);
        throw error;
    }
}

async function cartForUser(userId, requestId) {
    return traceDatabaseOperation(requestId, 'cart.populate_for_user', () =>
        Cart.findOne({ user: userId }).populate(cartPopulate)
    );
}

function serviceError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function validateQuantity(quantity) {
    if (!Number.isInteger(quantity) || quantity < 1) {
        throw serviceError('Quantity must be a positive integer', 400);
    }
}

async function getCartByUserId(userId, requestId) {
    let cart = await cartForUser(userId, requestId);
    if (!cart) {
        try {
            cart = await traceDatabaseOperation(requestId, 'cart.create_empty', () =>
                Cart.create({ user: userId, items: [] })
            );
        } catch (error) {
            // Another request may have created this user's unique cart first.
            if (error.code !== 11000) throw error;
        }
        cart = await cartForUser(userId, requestId);
    }
    return cart;
}

async function addToCart(userId, productId, quantity, size, color, requestId) {
    validateQuantity(quantity);
    if (typeof productId !== 'string' || !/^[a-f\d]{24}$/i.test(productId.trim())) {
        throw serviceError('Product ID must be a valid MongoDB ObjectId', 400);
    }
    const normalizedProductId = productId.trim();
    if (!size || !color) {
        throw serviceError('Size and color are required', 400);
    }

    const product = await traceDatabaseOperation(requestId, 'product.find_by_id', () =>
        Product.findById(normalizedProductId)
    );
    if (!product) throw serviceError('Product not found', 404);
    if (!product.inStock) throw serviceError('Product is out of stock', 400);
    if (!product.size.includes(size) || !product.color.includes(color)) {
        throw serviceError('Selected size or color is unavailable', 400);
    }

    let cart = await traceDatabaseOperation(requestId, 'cart.find_for_add', () =>
        Cart.findOne({ user: userId })
    );
    if (!cart) cart = new Cart({ user: userId, items: [] });

    const item = cart.items.find((entry) =>
        entry.product.toString() === normalizedProductId &&
        entry.size === size && entry.color === color
    );
    if (item) item.quantity += quantity;
    else cart.items.push({ product: normalizedProductId, quantity, size, color });

    await traceDatabaseOperation(requestId, 'cart.save_after_add', () => cart.save());
    return cartForUser(userId, requestId);
}

async function updateQuantity(userId, itemId, quantity, requestId) {
    validateQuantity(quantity);
    const cart = await traceDatabaseOperation(requestId, 'cart.find_for_update', () =>
        Cart.findOne({ user: userId })
    );
    if (!cart) throw serviceError('Cart not found', 404);

    const item = cart.items.id(itemId);
    if (!item) throw serviceError('Cart item not found', 404);
    item.quantity = quantity;
    await traceDatabaseOperation(requestId, 'cart.save_after_update', () => cart.save());
    return cartForUser(userId, requestId);
}

async function removeProductFromCart(userId, itemId, requestId) {
    const cart = await traceDatabaseOperation(requestId, 'cart.find_for_remove', () =>
        Cart.findOne({ user: userId })
    );
    if (!cart) throw serviceError('Cart not found', 404);
    const item = cart.items.id(itemId);
    if (!item) throw serviceError('Cart item not found', 404);
    item.deleteOne();
    await traceDatabaseOperation(requestId, 'cart.save_after_remove', () => cart.save());
    return cartForUser(userId, requestId);
}

async function removeAllProducts(userId, requestId) {
    const cart = await traceDatabaseOperation(requestId, 'cart.find_for_clear', () =>
        Cart.findOne({ user: userId })
    );
    if (!cart) return getCartByUserId(userId, requestId);
    cart.items = [];
    await traceDatabaseOperation(requestId, 'cart.save_after_clear', () => cart.save());
    return cartForUser(userId, requestId);
}

module.exports = {
    getCartByUserId,
    addToCart,
    updateQuantity,
    removeProductFromCart,
    removeAllProducts,
};
