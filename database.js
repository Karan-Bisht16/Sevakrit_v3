const mongoose = require("mongoose");

const connection = async () => {
    try {
        mongoose.set("strictQuery", true);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.")
    } catch (error) {
        console.log("Connection to MongoDB failed. \n\t Error:", error);
    }
}

module.exports = connection;