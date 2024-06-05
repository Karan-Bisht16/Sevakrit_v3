const express = require("express");
// for handling API requests
const axios = require("axios");
// to send mail
const nodemailer = require("nodemailer");
// to implement environment variables
require("dotenv").config();
const NGO = require("../models/ngo");
const User = require("../models/user");
const Donation = require("../models/donation");

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.DevSquadEmail,
        pass: process.env.EmailPassword
    }
});
function sendMail(senderEmails, donationData) {
    let first =
        `
            A donation was made with following details: <br> 
                <b>Donor</b>: ${donationData.donar_name}, <br>
                <b>Date of Donation</b>: ${donationData.date_of_donation}, <br>
                <b>Type of Donation</b>: ${donationData.type_of_donation}, <br>
        `;
    let middle = "";
    if (donationData.type_of_donation === "Food") {
        middle = `<b>Type of Event</b>: ${donationData.type_of_event},<br>`;
    }
    let addressHTML = "";
    const address = Object.values(donationData.user_pickup_address);
    if (donationData.user_pickup_address.reliable == 1) {
        addressHTML =
            `
            <b>Pickup Address</b>: 
            <a href="https://maps.google.com/?q=<${donationData.user_pickup_address.coordinates.latitude}>,<${donationData.user_pickup_address.coordinates.longitude}>">
                ${JSON.stringify(address[donationData.user_pickup_address.reliable])}
            </a><br>
        `
    } else {
        addressHTML = `<b>Pickup Address</b>: ${address[donationData.user_pickup_address.reliable]}<br>`;
    }
    let last =
        `
                <br><br>
                Thanks,
                <br>
                Sevakrit Team
        `;
    let text = first + middle + addressHTML + last;
    const mailOptions = {
        from: process.env.DevSquadEmail,
        to: senderEmails.toString(),
        bcc: senderEmails,
        subject: "A new donation!",
        html: text
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("Error on Nodemailer side: ", error);
        } else {
            console.log("Email sent to nearby NGOs.");
        }
    });
}
async function geocode(address) {
    // default co-ordinates to be used in case Openstreetmap doesn't provide meaningful data
    let returnResult = { latitude: 28.6139, longitude: 77.2090 };
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${address}`;

    await fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                // selects first set of co-ordinates out of multiple possible co-ordinates
                const result = data[0];
                returnResult.latitude = result.lat;
                returnResult.longitude = result.lon;
            } else {
                console.log("Openstreetmap counldn't find the co-ordiantes")
            }
        })
        .catch((error) => {
            console.log("Error connecting to Openstreetmaps:", error);
        });

    return returnResult;
}

router.get("/donate", (req, res) => {
    if (!req.session.userID) {
        req.flash("error", "<a href='/signIn'>Log in</a> or <a href='/signUp'>create an account</a> to view protected content.")
        res.redirect("/signUp");
    } else if (req.session.type === "ngo") {
        req.flash("error", "Access requires user registration.");
        res.redirect("/");
    } else {
        const next = new Date();
        next.setDate(next.getDate() + 1);
        res.render("donate.ejs", { user: req.session, date: next.toISOString().slice(0, 10) });
    }
});

router.post("/donate", async (req, res) => {
    // to check for valid dateOfDonation
    if (!(new Date(req.body["dateOfDonation"]) < new Date())) {
        // find co-ordinates to given pickup address
        await geocode(req.body["pickupAddress"])
            .then(async (response) => {
                // if req.body contains "currLoc": this means co-ordinates are reliable
                // else: this means address inside textarea is reliable

                let newDonation = new Donation({
                    donar_name: req.body["userName"],
                    donar_email: req.session.userID,
                    date_of_donation: req.body["dateOfDonation"],
                    type_of_donation: req.body["donationType"],
                    type_of_event: req.body["donationType"] === "Food" ? req.body["eventType"] : " ",
                    user_pickup_address: {
                        humanReadableAddress: req.body.currLoc ? req.body["addressCalc"] : req.body["pickupAddress"],
                        coordinates: req.body.currLoc ? JSON.parse(req.body["coordinates"]) : (req.body["coordinates"] === "" ? response : req.body["coordinates"]),
                        reliable: req.body.currLoc ? 1 : 0
                    },
                    donation_status: {
                        status: 0,
                        NGO_name: ""
                    },
                    visibility: req.body["visibility"]
                });
                // saving new donation details in DB
                try {
                    await newDonation.save();
                    let i = 0;
                    // .then(async (result) => {
                    let destination = "";
                    // emails of all NGOs will be stored in NGOemails
                    let NGOemails = [];
                    // range of all NGOs will be stored in NGOrange
                    let NGOrange = [];
                    let resultNGO;
                    try {
                        if (req.body["visibility"] == 2) {
                            resultNGO = await NGO.find({ NGO_isVerified: true });
                        } else {
                            resultNGO = await NGO.find();
                        }
                    } catch (error) {
                        console.log("Error retrieving NGO data: ", error);
                        res.render("donate.ejs", { user: req.session, error: "Someting went wrong. Try again." });
                    }
                    const origin = newDonation.user_pickup_address.coordinates.latitude + "," + newDonation.user_pickup_address.coordinates.longitude;
                    resultNGO.forEach(NGO => {
                        if (i === resultNGO.length) {
                            destination += NGO.NGO_address.coordinates.latitude + "," + NGO.NGO_address.coordinates.longitude;
                        } else {
                            destination += NGO.NGO_address.coordinates.latitude + "," + NGO.NGO_address.coordinates.longitude + ";";
                        }
                        NGOemails.push(NGO.email);
                        NGOrange.push(NGO.NGO_range);
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
                            let j = 0;
                            let results = responseAPI.data.distances[0];
                            // filtering out all NGOs whose distance is more than their range  
                            results.forEach(result => {
                                if (result / 1000 > NGOrange[j]) {
                                    NGOemails.splice(j, 1);
                                }
                                j++;
                            })
                            sendMail(NGOemails, newDonation);
                            req.flash("success", "Donation successful!");
                            res.redirect("/");
                        }).catch(error => {
                            console.log("API Error:" + error);
                            res.render("donate.ejs", { user: req.session, error: "Someting went wrong. Try again." });
                        });
                } catch (error) {
                    console.log("Error saving donation: ", error);
                    res.render("donate.ejs", { user: req.session, error: "Someting went wrong. Try again." });
                }
            }).catch(error => {
                console.log("Error from Openstreetmap: ", error);
                res.render("donate.ejs", { user: req.session, error: "Someting went wrong. Try again." });
            });
    } else {
        res.render("donate.ejs", { user: req.session, error: "Please enter valid date of donation" })
    }
});

module.exports = router;