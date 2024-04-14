const mongoose = require("mongoose");
const user_Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    user_mobile_number: {
        type: Number,
        required: true
    },
    user_password: {
        type: String,
        required: true
    },
    user_date_of_joining: {
        type: String,
        required: true
    },
    user_isTrusted: {
        type: Boolean,
        required: true
    }
});

const User = mongoose.model('User', user_Schema);
module.exports = User;
