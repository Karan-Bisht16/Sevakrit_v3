const mongoose = require("mongoose");
const donation_Schema = new mongoose.Schema({
    donar_name: {
        type: String,
        required: true,
    },
    donar_email: {
        type: String,
        required: true,
    },
    date_of_donation: {
        type: Date,
        required: true,
    },
    type_of_donation: {
        type: String,
        required: true,
    },
    type_of_event: {
        type: String,
    },
    user_pickup_address: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    donation_status: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    visibility: {
        type: Number,
        required: true,
    }
});

const Donation = mongoose.model("Donation", donation_Schema);
module.exports = Donation;
