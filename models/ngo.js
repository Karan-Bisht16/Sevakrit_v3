const mongoose = require("mongoose");
const NGO_Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    NGO_registration_number: {
        type: String,
        required: true
    }, 
    NGO_address: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    NGO_range: {
        type: Number,
        required: true
    },
    NGO_sectors: {
        type: String
    },
    NGO_webpage: {
        type: String
    },
    NGO_password: {
        type: String,
        requireed: true
    },
    NGO_date_of_joining: {
        type: String,
        required: true
    },
    NGO_isVerified: {
        type: Boolean,
        required: true
    }
});

const NGO = mongoose.model("NGO", NGO_Schema);
module.exports = NGO;