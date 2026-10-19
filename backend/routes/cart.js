const express = require('express');
const router = express.Router();
const Cart = require('../controllers/cartController');

router.get('/', Cart.getCartByUserId);
router.post('/',Cart.addToCart);
router.put('/items/:itemId',Cart.updateQuantity);
router.delete('/items/:itemId',Cart.removeProductFromCart);
router.delete('/',Cart.removeAllProducts);

module.exports = router;
