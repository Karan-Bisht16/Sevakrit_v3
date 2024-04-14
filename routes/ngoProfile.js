const express = require("express");
// for handling API requests
const axios = require("axios");
// to implement environment variables
require("dotenv").config();
const NGO = require("../models/ngo");
const Donation = require("../models/donation");

const router = express.Router();

router.get("/profile/ngo/:ngoname", async (req, res) => {
    if (req.session.userName && req.session.userID) {
        if (req.session.type === "ngo") {
            // to find corresponding ngo
            await NGO.findOne({ email: req.session.userID })
            .then(resultNGO => {
                let i = 0;
                let destination = "";
                // to find all 'open' donations
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
                                res.render("profileNGO.ejs", { user: resultNGO.name, NGOData: resultNGO, type: req.session.type, donationData: resultDonation, response: responseAPI.data });
                            }).catch(error => {
                                console.log("API Error: " + error);
                                res.render("home.ejs", {error: "Something went wrong. Try again."});
                            });
                    }).catch(error => {
                        console.log("Error retrieving donation data: " + error);
                        res.render("home.ejs", {error:"Someting went wrong. Try again."})
                    });
            }).catch(error => {
                console.log("Error finding ngo: ", error);
                res.render("signUpNGO.ejs", {error: "Unable to find NGO. Try logging in or sign-up."});
            });
        } else if (req.session.type === "user") {
            res.redirect(`/profile/user:${req.session.userName}`);
        } else {
            res.render("home.ejs", { error: "Invalid user type" });
        }
    } else {
        res.render("signUpNGO.ejs", { error: null });
    }
});

router.post("/profile/ngo/:ngoname", (req, res) => {
    req.session.location = req.body["latitude"] + "_" + req.body["longitude"];
    console.log("[POST] `/`      Current User Location: " + req.session.location);
    req.session.nearbyNGOs = [];
    if (req.session.userName && req.session.type==="ngo") {
        // to find all open donations
        Donation.find({ donation_status: { status: 0, NGO_name: "" } })
        .then(function (resultsDonation) {
            res.send({ dataDonation: resultsDonation});
        }).catch(error => {
            console.log("Error retrieving donation data: " + error);
            res.render("home.ejs", { error: "Error finding nearby donations. Please refresh." });
        });
    } else if (req.session.userName && req.session.type === "ngo") {
        res.redirect(`/profile/user:${req.session.userName}`);
    } else {
        res.render("signUpNGO.ejs", { error: null });
    }
});

module.exports = router;