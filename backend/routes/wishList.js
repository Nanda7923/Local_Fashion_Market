const express = require('express');
const router = express.Router();
const WishList = require('../controllers/wishListController');

router.get('/',WishList.getWishList);
router.post('/:productId',WishList.addProductToWishList);
router.delete('/:productId',WishList.removeProductFromWishList);
router.delete('/',WishList.removeWishList);

module.exports = router;