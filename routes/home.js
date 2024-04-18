const express = require("express");
// to implement a server side scheduler
const cron = require("node-cron");
const Donation = require("../models/donation");
const NGO = require("../models/ngo");

const router = express.Router();

// this function will execute everyday [once a day]
async function markingExpiredDonations() {
    await Donation.updateMany({ "date_of_donation": { $lt: new Date }, donation_status: { status: 0, NGO_name: "" } }, { donation_status: { status: 2, NGO_name: "" } })
        .then(results => {
            console.log(results);
        });
}
// function scheduled to be executed at midnight
cron.schedule("0 0 * * *", () => {
    markingExpiredDonations();
});
// function scheduled to be executed at 8PM
cron.schedule("0 20 * * *", () => {
    markingExpiredDonations();
});

router.get("/", async (req, res) => {
    req.session.location = req.session.location || "";
    console.log("[GET]  `/`      Current User Location: " + req.session.location);
    if (req.session.userName && req.session.userID && req.session.type) {
        res.render("home.ejs", { user: req.session.userName, type: req.session.type });
    } else {
        res.render("home.ejs");
    }
});

router.post("/", (req, res) => {
    req.session.location = req.body["latitude"] + "_" + req.body["longitude"];
    console.log("[POST] `/`      Current User Location: " + req.session.location);
    req.session.nearbyNGOs = [];
    // to find all nearby ngo
    NGO.find()
        .then(resultNGO => {
            if (req.session.userName && req.session.type === "user") {
                // if a registered user then make public and protected donations visible
                Donation.find({
                    $or: [
                        { donation_status: { status: 0, NGO_name: "" }, visibility: { $in: [0, 1] } },
                        { donar_email: req.session.userID }
                    ]
                })
                    .then(resultDonation => {
                        res.send({ dataDonation: resultDonation, dataNGO: resultNGO, donarID: req.session.userID });
                    }).catch(error => {
                        console.log("Error retrieving donation data [public+protected]: ", error);
                        res.render("home.ejs", { error: "Error finding nearby donations. Please refresh." });
                    })
            } else if (req.session.userName && req.session.type === "ngo") {
                // if a registered ngo then make all donations visible
                Donation.find({ donation_status: { status: 0, NGO_name: "" } })
                    .then(resultAllDonations => {
                        res.send({ dataDonation: resultAllDonations, dataNGO: resultNGO });
                    }).catch(error => {
                        console.log("Error retrieving donation data [public+protected]: ", error);
                        res.render("home.ejs", { error: "Error finding nearby donations. Please refresh." });
                    });
            } else {
                // if an unregistered user then make only public donations visible
                Donation.find({ donation_status: { status: 0, NGO_name: "" }, visibility: 0 })
                    .then(resultLimitedDonations => {
                        res.send({ dataDonation: resultLimitedDonations, dataNGO: resultNGO });
                    }).catch(error => {
                        console.log("Error retrieving donation data [public+protected]: ", error);
                        res.render("home.ejs", { error: "Error finding nearby donations. Please refresh." });
                    });
            }
        }).catch(error => {
            console.log("Error fetching ngos detail: ", error);
            res.render("home.ejs", { error: "Error finding nearby NGOs. Please refresh." });
        });
});

module.exports = router;