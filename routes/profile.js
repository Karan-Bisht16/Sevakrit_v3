const express = require("express");
// for handling API requests
const axios = require("axios");
// to implement environment variables 
require("dotenv").config();
const NGO = require("../models/ngo");
const User = require("../models/user");
const Donation = require("../models/donation");
const { userLoggedIn, ngoLoggedIn } = require("../loginMiddleware");

const router = express.Router();

router.get("/profile/user/:username", userLoggedIn, async (req, res) => {
    try {
        let userData = await User.findOne({ email: req.session.userID });
        Donation.find({ donar_email: req.session.userID })
            .then(donations => {
                res.render("profile.ejs", { user: req.session, userData, donationData: donations });
            }).catch(error => {
                console.log("Error fetching donations: ", error);
                req.flash("error", "Server side error. Try again.");
                res.redirect("/");
            });
    }
    catch (error) {
        console.log("Error finding user: ", error);
        req.flash("error", "No such user found. <a href='/signIn'>Log in</a> or <a href='/signUp'>create an account</a>.");
        res.redirect("/");
    }
});

router.get("/profile/ngo/:ngoname", ngoLoggedIn, async (req, res) => {
    await NGO.findOne({ email: req.session.userID })
        .then(resultNGO => {
            let i = 0;
            let destination = "";
            // to find all "open" donations
            Donation.find({ donation_status: { status: 0, NGO_name: "" } })
                .then(resultDonation => {
                    const origin = resultNGO.NGO_address.coordinates.latitude + "," + resultNGO.NGO_address.coordinates.longitude;
                    resultDonation.forEach(donation => {
                        if (i === resultDonation.length) {
                            destination += donation.user_pickup_address.coordinates.latitude + "," + donation.user_pickup_address.coordinates.longitude;
                        } else {
                            destination += donation.user_pickup_address.coordinates.latitude + "," + donation.user_pickup_address.coordinates.longitude + ";";
                        }
                        i++;
                    });
                    // get distance between origin and all co-ordinates in destination
                    const options = {
                        method: "GET",
                        url: "https://trueway-matrix.p.rapidapi.com/CalculateDrivingMatrix",
                        params: {
                            origins: origin,
                            destinations: destination
                        },
                        headers: {
                            "X-RapidAPI-Key": process.env.RapidAPI_Key,
                            "X-RapidAPI-Host": process.env.RapidAPI_Host
                        }
                    };
                    axios.request(options)
                        .then(responseAPI => {
                            res.render("profileNGO.ejs", { user: req.session, NGOData: resultNGO, donationData: resultDonation, response: responseAPI.data });
                        }).catch(error => {
                            console.log("API Error: " + error);
                            req.flash("error", "Something went wrong. Refresh to resolve.");
                            res.redirect("/");
                        });
                }).catch(error => {
                    console.log("Error retrieving donation data: " + error);
                    req.flash("error", "Something went wrong. Refresh to resolve.");
                    res.redirect("/");
                });
        }).catch(error => {
            console.log("Error finding ngo: ", error);
            req.flash("error", "Unable to find NGO. <a href='/signIn'>Log in</a> or <a href='/signUp'>create an account</a>.");
            res.redirect("/");
        });
});

router.post("/profile/ngo/:ngoname", ngoLoggedIn, async (req, res) => {
    req.session.location = req.body["latitude"] + "_" + req.body["longitude"];
    req.session.nearbyNGOs = [];
    try {
        let resultsDonation = await Donation.find({ donation_status: { status: 0, NGO_name: "" } })
        res.send({ dataDonation: resultsDonation });
    }
    catch (error) {
        console.log("Error finding ngo: ", error);
        req.flash("error", "No such NGO found. <a href='/signIn'>Log in</a> or <a href='/signUp'>create an account</a>.");
        res.redirect("/");
    }
});

module.exports = router;