const newsletterService = require('../services/newsletterService');
const resError = require('../middlewares/resError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function subscribe(req, res) {
    try {
        const rawEmail = typeof req.body.email === 'string' ? req.body.email : '';
        const trimmedEmail = rawEmail.trim();

        if (!trimmedEmail) {
            return res.status(400).json({
                message: 'Please enter your email address.',
            });
        }

        if (!EMAIL_REGEX.test(trimmedEmail)) {
            return res.status(400).json({
                message: 'Please enter a valid email address.',
            });
        }

        const result = await newsletterService.subscribe(trimmedEmail);

        if (result.alreadySubscribed) {
            return res.status(409).json({
                message: "You're already subscribed.",
                alreadySubscribed: true,
                data: result.subscriber,
            });
        }

        return res.status(201).json({
            message: "You're subscribed! Look out for the latest arrivals and exclusive updates from Burma Collections.",
            alreadySubscribed: false,
            data: result.subscriber,
        });
    } catch (err) {
        if (err && err.code === 11000) {
            return res.status(409).json({
                message: "You're already subscribed.",
                alreadySubscribed: true,
            });
        }
        return resError(res, err);
    }
}

async function getAllSubscribers(req, res) {
    try {
        const subscribers = await newsletterService.getAllSubscribers();
        return res.json({
            message: 'Success',
            data: subscribers,
        });
    } catch (err) {
        return resError(res, err);
    }
}

module.exports = {
    subscribe,
    getAllSubscribers,
};
