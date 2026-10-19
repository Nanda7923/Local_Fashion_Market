const Review = require("./../models/Review");
const Product = require('./../models/Product');

async function createReview( userId, productId, rating, comment ){
    let product = await Product.findById(productId);
    if(!product){
        const err = new Error("Product not found");
        err.statusCode = 404;
        throw err;
    }
    const review = await Review.findOneAndUpdate(
        { user: userId, product: productId },
        { $set: { rating, comment: comment ?? "" } },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    await Review.deleteMany({ user: userId, product: productId, _id: { $ne: review._id } });
    return review;
}

async function getReviewsByProductId(productId){
    let reviews = await Review.find({product : productId})
                                .populate("user","name profilePic")
                                .sort({ createdAt: -1 });
    const uniqueReviews = new Map();
    for (const review of reviews) {
        const userId = review.user?._id?.toString();
        if (userId && !uniqueReviews.has(userId)) uniqueReviews.set(userId, review);
    }
    return [...uniqueReviews.values()];
}

async function getReviewsByUserId(userId){
    let reviews = await Review.find({user : userId})
                                .populate("user", "name profilePic")
                                .populate("product", "title brand category")
                                .sort({ createdAt: -1 });
    if(!reviews){
        throw new Error("Review not found");
    }
    return await reviews;
}

async function updateReview(reviewId, userId, review){
    return await Review.findOneAndUpdate(
        { _id: reviewId, user: userId },
        { $set: { rating: review.rating, comment: review.comment ?? "" } },
        { returnDocument: 'after', runValidators: true }
    ).populate("user", "name profilePic");
}

async function deleteReview(reviewId, userId){
    return await Review.findOneAndDelete({ _id: reviewId, user: userId });
}

async function getAverageRating(productId){
    const reviews = await Review.find({product : productId}).sort({ createdAt: -1 });
    const uniqueReviews = new Map();
    for (const review of reviews) {
        const userId = review.user.toString();
        if (!uniqueReviews.has(userId)) uniqueReviews.set(userId, review);
    }
    if(uniqueReviews.size === 0){
        return{
            averageRating : 0,
            reviewCount : 0
        }

    }else{
        let total = 0;
        let reviewCount = 0;
        for(const review of uniqueReviews.values()){
            total += review.rating;
            reviewCount += 1;
        }
        let averageRating = total/reviewCount;
        return {
            averageRating,
            reviewCount
        }
    }
}

module.exports = {
    createReview,
    getReviewsByProductId,
    getReviewsByUserId,
    updateReview,
    deleteReview,
    getAverageRating
}
