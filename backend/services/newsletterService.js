const NewsletterSubscriber = require('../models/NewsletterSubscriber');

async function subscribe(email) {
    const normalizedEmail = (email || '').trim().toLowerCase();

    const existing = await NewsletterSubscriber.findOne({ email: normalizedEmail });
    if (existing) {
        return {
            alreadySubscribed: true,
            subscriber: existing,
        };
    }

    try {
        const subscriber = new NewsletterSubscriber({ email: normalizedEmail });
        await subscriber.save();
        return {
            alreadySubscribed: false,
            subscriber,
        };
    } catch (error) {
        if (error && error.code === 11000) {
            const current = await NewsletterSubscriber.findOne({ email: normalizedEmail });
            return {
                alreadySubscribed: true,
                subscriber: current,
            };
        }
        throw error;
    }
}

async function getAllSubscribers() {
    return await NewsletterSubscriber.find().sort({ createdAt: -1 });
}

async function getSubscriberByEmail(email) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    return await NewsletterSubscriber.findOne({ email: normalizedEmail });
}

module.exports = {
    subscribe,
    getAllSubscribers,
    getSubscriberByEmail,
};
