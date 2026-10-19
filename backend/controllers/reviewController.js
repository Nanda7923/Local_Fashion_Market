const reviewService = require('./../services/reviewService');
const resError = require("../middlewares/resError");

function getStatusCode(err) {
    if (err && typeof err.statusCode === 'number') {
        return err.statusCode;
    }
    if (err && (err.name === 'ValidationError' || err.name === 'CastError')) {
        return 400;
    }
    if (err && (err.message === 'Product not found' || err.message === 'Review not found')) {
        return 404;
    }
    return 500;
}

async function createReview(req, res) {
    try{
        let productId = req.params.id;
        let userId = req.user.userId;
        let { rating, comment } = req.body;


        let review = await reviewService.createReview(userId, productId , rating, comment);

        if(!review){
            return resError(res,"You can't create Review",404);
        }else{
            res.status(200).json({
                message: 'Review saved successfully',
                data : review
            });
        }
    }catch(err) {
        return resError(res, err, getStatusCode(err));
    }
}

async function getReviewsByProductId(req, res) {
    try{
        let productId = req.params.id;
        let reviews = await reviewService.getReviewsByProductId(productId)
        if(!reviews){
            return resError(res,"Review not found",404);
        }else{
            res.json({
                message : "Review found successfully",
                data : reviews
            })
        }
    }catch(err){
        return resError(res, err, getStatusCode(err));
    }

}

async function getReviewsByUserId(req,res){
    try{
        let userId = req.user.userId;
        let reviews = await reviewService.getReviewsByUserId(userId);
        if(!reviews){
            return resError(res,"Review not found",404);
        }else{
            res.json({
                message : "Review found successfully",
                data : reviews
            })
        }
    }catch(err){
        return resError(res, err, getStatusCode(err));
    }

}

async function updateReview(req, res){
    try{
       let review = { rating: req.body.rating, comment: req.body.comment };
       let reviewId = req.params.id;
       let updatedReview = await reviewService.updateReview(reviewId, req.user.userId, review);
       if(!updatedReview){
           return resError(res,"Review not found",404);
       }else{
           res.json({
               message : "Review updated successfully",
               data : updatedReview
           })
       }
    }catch(err){
        return resError(res, err, getStatusCode(err));
    }
}

async function deleteReview(req, res){
    try {
        let reviewId = req.params.id;
        let review = await reviewService.deleteReview(reviewId, req.user.userId);
        if (!review) {
            return resError(res,"Review not found",404);
        } else {
            res.json({
                message: "Review deleted successfully",
                data: review
            })
        }
    }catch(err){
        return resError(res, err, getStatusCode(err));
    }
}

async function getAverageRating(req, res){
    try{
        let productId = req.params.id;
        let review = await reviewService.getAverageRating(productId);
        res.json({
            message : "Review found successfully",
            data : review,
        })
    }catch(err){
        return resError(res, err, getStatusCode(err));
    }
}

module.exports = {
    createReview,
    getReviewsByProductId,
    getReviewsByUserId,
    updateReview,
    deleteReview,
    getAverageRating,
}
