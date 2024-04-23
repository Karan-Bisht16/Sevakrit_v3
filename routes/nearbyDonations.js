const express = require("express");
const Donation = require("../models/donation");

const router = express.Router();
router.get("/nearbyDonations", async (req, res) => {
    if (req.session.userName && req.session.userID) {
        if (req.session.type === "ngo") {
            let donations = await Donation.find({ donation_status: { status: 0, NGO_name: "" } });
            res.render("nearbyDonations.ejs", { user: req.session, donationData: donations });
        } else if (req.session.type === "user") {
            let donations = await Donation.find({
                $or: [
                    { donation_status: { status: 0, NGO_name: "" }, visibility: { $in: [0, 1] } }
                ]
            })
            res.render("nearbyDonations.ejs", { user: req.session, donationData: donations });
        }
    } else {
        req.flash("error", "<a href='/signIn'>Log in</a> or <a href='/signUp'>create an account</a> to view protected content.")
        res.redirect("/");
    }
});

module.exports = router;