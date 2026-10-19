const WishList = require("../models/WishList");

async function getWishList(userId){
    let wishList = await WishList.findOne({ user: userId }).populate("products");
    return wishList;
}

async function addProductToWishList(userId,productId){
    let wishList =await WishList.findOne({user : userId});
    if(!wishList){
        let newWishList = new WishList({
            user : userId,
            products : [productId]
        });
        await newWishList.save();
        return newWishList;
    }
    console.log("wishList =>",wishList)
    if(wishList.products.includes(productId.toString())){
        return wishList;
    }
    wishList.products.push(productId);
    return await wishList.save();
}

async function removeProductFromWishList(userId,productId){
    let wishList = await WishList.findOne({user : userId});
    if(!wishList){
        const error = new Error("WishList not found");
        error.statusCode = 404;
        throw error;
    }
    wishList.products = wishList.products.filter(
        product => product.toString() !== productId.toString()
    );

    await wishList.save();

    return wishList;
}

async function removeWishList(userId){
    let wishList = await WishList.findOne({user : userId});
    if(!wishList){
        return { user: userId, products: [] };
    }
    wishList.products = [];
    await wishList.save();
    return wishList;
}



module.exports = {
    getWishList,
    addProductToWishList,
    removeProductFromWishList,
    removeWishList
}
