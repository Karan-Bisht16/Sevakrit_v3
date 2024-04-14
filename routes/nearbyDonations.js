const express = require("express");
const Donation = require("../models/donation");

const router = express.Router();
router.get('/nearbyDonations', async (req, res) => {
    let donations = await Donation.find({ donation_status: { status: 0, NGO_name: "" } });
    // when donation visibility is implemented
    // let donations = await Donation.find({ donation_status: { status: 0, NGO_name: "" }, donation_visibility: true });
    if (req.session.userName && req.session.userID) {
        if (req.session.type === "user" || req.session.type === "ngo") {
            res.render('nearbyDonations.ejs', { user: req.session.userName, donationData: donations, type: req.session.type });
        } else {
            res.redirect('/', { error: "Invalid user. Please sign-in again." });
        }
    } else {
        res.render("signInNGO.ejs", { error: null });
    }
});

module.exports = router;