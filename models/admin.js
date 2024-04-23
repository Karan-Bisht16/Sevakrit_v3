const mongoose = require("mongoose");
const admin_Schema = new mongoose.Schema({
    admin_email: {
        type: String,
        required: true
    }
});

const Admin = mongoose.model('Admin', admin_Schema);
module.exports = Admin;
