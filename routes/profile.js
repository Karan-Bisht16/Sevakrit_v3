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
const { userLoggedIn, ngoLoggedIn } = require("../loginMiddleware");

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.DevSquadEmail,
        pass: process.env.EmailPassword
    }
});
function sendMail(senderEmail, ngoData) {
    let text =
        `
            Your donation was accepted by: <br> 
                <b>NGO </b>: ${ngoData.name}, <br>
                <b>Registration Number</b>: ${ngoData.NGO_registration_number}, <br>
                <b>E-mail</b>: ${ngoData.email}, <br>
            <br><br>
            Thanks,
            <br>
            Sevakrit Team
        `;
    const mailOptions = {
        from: process.env.DevSquadEmail,
        to: senderEmail,
        subject: "Your donation has been accepted!",
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
    try {
        let resultNGO = await NGO.findOne({ email: req.session.userID });
        let i = 0;
        let destination = "";
        try {
            let resultDonation;
            // if NGO is verified then show all donations (irrespective of visibility) that are open 
            // or were previously accepted by that NGO
            if (resultNGO.NGO_isVerified) {
                resultDonation = await Donation.find({
                    $or: [
                        { donation_status: { status: 0, NGO_name: "" } },
                        { donation_status: { status: 1, NGO_name: req.session.userName } }
                    ]
                });
            } else {
                resultDonation = await Donation.find({
                    $or: [
                        { donation_status: { status: 0, NGO_name: "" }, visibility: { $in: [0, 1] } },
                        { donation_status: { status: 1, NGO_name: req.session.userName } }
                    ]
                });
            }
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
            try {
                let responseAPI = await axios.request(options)
                res.render("profileNGO.ejs", { user: req.session, NGOData: resultNGO, donationData: resultDonation, response: responseAPI.data });
            } catch (error) {
                console.log("API Error: " + error);
                req.flash("error", "Something went wrong. Refresh to resolve.");
                res.redirect("/");
            }
        } catch (error) {
            console.log("Error retrieving donation data: " + error);
            req.flash("error", "Something went wrong. Refresh to resolve.");
            res.redirect("/");
        }
    } catch (error) {
        console.log("Error finding ngo: ", error);
        req.flash("error", "Unable to find NGO. <a href='/signIn'>Log in</a> or <a href='/signUp'>create an account</a>.");
        res.redirect("/");
    }
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

router.put("/profile/ngo/accept-donation", ngoLoggedIn, async (req, res) => {
    const { donationID } = req.body;
    try {
        let donation = await Donation.findByIdAndUpdate(donationID, { donation_status: { status: 1, NGO_name: req.session.userName } });
        let ngo = await NGO.findOne({email: req.session.userID});
        sendMail(donation.donar_email, ngo);
        res.sendStatus(200);
    } catch (error) {
        console.log("Error in accepting donation: ", error);
        res.sendStatus(500);
    }
});

module.exports = router;