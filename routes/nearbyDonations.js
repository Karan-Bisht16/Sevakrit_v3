const express = require("express");
const Donation = require("../models/donation");

const router = express.Router();
router.get('/nearbyDonations', async (req, res) => {
    // when donation visibility is implemented
    // let donations = await Donation.find({ donation_status: { status: 0, NGO_name: "" }, donation_visibility: true });
    if (req.session.userName && req.session.userID) {
        if (req.session.type === "ngo") {
            let donations = await Donation.find({ donation_status: { status: 0, NGO_name: "" } });
            res.render('nearbyDonations.ejs', { user: req.session.userName, donationData: donations, type: "ngo" });
        } else if (req.session.type === "user") {
            let donations = await Donation.find({
                $or: [
                    { donation_status: { status: 0, NGO_name: "" }, visibility: { $in: [0, 1] } }
                ]
            })
            res.render('nearbyDonations.ejs', { user: req.session.userName, donationData: donations, type: "user" });
        }
    } else {
        res.render("signInNGO.ejs", { error: null });
    }
});

module.exports = router;