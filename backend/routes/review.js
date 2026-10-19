const express = require('express');
const router = express.Router();
const Review = require('./../controllers/reviewController')
const {verify} = require("../middlewares/auth");

router.post('/:id',verify,Review.createReview);
router.get('/averageRating/:id',Review.getAverageRating)
router.get('/:id',Review.getReviewsByProductId);
router.get('/',verify,Review.getReviewsByUserId);
router.put('/:id',verify,Review.updateReview);
router.delete('/:id',verify,Review.deleteReview);


module.exports = router;