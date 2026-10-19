let AdminDashboard = require('./../controllers/adminDashboardController');
const express = require ('express');
const router = express.Router();
const { verify, checkRole } = require('../middlewares/auth');
const Review = require('../models/Review');
const resError = require('../middlewares/resError');

router.use(verify, checkRole('Admin'));
router.get('/dashboard',AdminDashboard.adminDashboardController);
router.get('/reviews', async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'name email profilePic')
            .populate('product', 'title imageUrl')
            .sort({ createdAt: -1 });
        res.json({ message: 'Success', data: reviews });
    } catch (err) {
        return resError(res, err);
    }
});
router.delete('/reviews/:reviewId', async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.reviewId);
        if (!review) return resError(res, 'Review not found', 404);
        res.json({ message: 'Review deleted successfully', data: review });
    } catch (err) {
        return resError(res, err);
    }
});

module.exports = router;
