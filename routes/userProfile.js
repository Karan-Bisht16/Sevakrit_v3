const express = require("express");
const User = require("../models/user");
const Donation = require("../models/donation");

const router = express.Router();

router.get("/profile/user/:username", async (req, res) => {
    if (req.session.userName && req.session.userID) {
        if (req.session.type === "user") {
            await User.findOne({ email: req.session.userID })
                .then(result => {
                    Donation.find({ donar_email: req.session.userID })
                        .then(donations => {
                            res.render("profile.ejs", { user: result.name, userData: result, donationData: donations, type: "user" });
                        }).catch(error => {
                            console.log("Error finding donations: ", error);
                            res.render("home.ejs", { error: "Server side error." })
                        })
                }).catch(error => {
                    console.log("Error finding user: ", error);
                    res.render("home.ejs", { error: "No such user. Try sign-up or login." })
                });

        } else if (req.session.type === "ngo") {
            res.redirect(`/profile/ngo:${req.session.userName}`);
        } else {
            res.render("home.ejs", { error: "Invalid user type" });
        }
    } else {
        res.render("sign_up.ejs", { error: null });
    }
});

module.exports = router;