const mongoose = require('mongoose');
const { Schema } = mongoose;

const NewsletterSubscriberSchema = new Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
        },
    },
    {
        timestamps: true,
    }
);

const NewsletterSubscriber = mongoose.model('NewsletterSubscriber', NewsletterSubscriberSchema);

module.exports = NewsletterSubscriber;
