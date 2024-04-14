const mongoose = require("mongoose");
const review_Schema = mongoose.Schema({
    rating: {
        type: Number,
        min: 0,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        required: true
    },
}, { timestamps: true });

const Review = mongoose.model("Review", review_Schema)
module.exports = Review;