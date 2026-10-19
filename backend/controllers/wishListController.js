const wishListService = require("../services/wishListService");
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

async function getWishList(req, res) {
    try{
        let wishList = await wishListService.getWishList(req.user.userId);
            res.json({
                message : "Successfully getWishList",
                data : wishList
            })
    }catch(err){
        return resError(res, err, getStatusCode(err));
    }
}

async function addProductToWishList(req, res) {
    try{
        let userId = req.user.userId;
        let {productId} = req.params;
        let wishList = await wishListService.addProductToWishList(userId, productId);
        if(!wishList){
            return resError(res,"Wish list not found",404);
        }else{
            res.json({
                message : "Successfully addProductToWishList",
                data : wishList
            })
        }
    }catch(err){
        return resError(res, err, getStatusCode(err));
    }
}

async function removeProductFromWishList(req, res) {
    try{
        let userId = req.user.userId;
        let {productId} = req.params;
        let wishList = await wishListService.removeProductFromWishList(userId,productId);
            res.json({
                message : "Successfully removeProductFromWishList",
                data : wishList
            })
    }catch(err){
        return resError(res, err, getStatusCode(err));
    }
}

async function removeWishList(req, res) {
    try{
        let userId = req.user.userId;
        let wishList = await wishListService.removeWishList(userId);
        if(!wishList){
            return resError(res,"Wish list not found",404);
        }else{
            res.json({
                message : "Successfully removeWishList",
                data : wishList
            })
        }
    }catch(err){
        return resError(res, err, getStatusCode(err));
    }
}

module.exports = {
    getWishList,
    addProductToWishList,
    removeProductFromWishList,
    removeWishList,
}
