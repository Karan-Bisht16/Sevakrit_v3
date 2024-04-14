const express = require("express");
const Review = require("../models/review");

const router = express.Router();

router.get("/feedback", async (req, res) => {
    // find all reviews in DB
    let reviews = await Review.find();
    if (req.session.userName && req.session.userID) {
        // if user or ngo already signed-in then autofill their form
        if (req.session.type === "user" || req.session.type === "ngo") {
            res.render("feedback.ejs", { user: req.session.userName, type: req.session.type, email: req.session.userID, reviews });
        } else {
            res.redirect('/', { error: "Invalid user. Please sign-in again." });
        }
    } else {
        res.render("feedback.ejs", { reviews });
    }
});

router.post("/feedback", async (req, res) => {
    let { rating, comment, email } = req.body;
    let review = new Review({ rating, comment, email });
    await review.save();
    res.redirect("/feedback");
})

module.exports = router;