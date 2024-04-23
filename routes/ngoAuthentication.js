const express = require("express");
// to encrypt passwords
const bcrypt = require("bcrypt");
const saltRounds = 10;
const NGO = require("../models/ngo");

const router = express.Router();

const regexEmail = /^([a-zA-Z0-9_\.\-]+)@([a-zA-Z0-9_\.\-]+)\.([a-zA-Z]+)/;

function dateOfJoining() {
    const date = new Date;
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
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

router.get("/signUpNGO", (req, res) => {
    if (req.session.type || req.session.userID || req.session.userName) {
        res.redirect("/");
    } else {
        res.render("signUpNGO.ejs", { error: null });
    }
});

router.post("/signUpNGO", async (req, res) => {
    // to check for valid email
    if (regexEmail.test(req.body["NGOEmail"])) {
        let ngos = await NGO.find({ email: req.body["NGOEmail"] });
        // to make sure that registered emails are unique
        if (ngos.length == 0) {
            let uniqueRegistrationNumber = await NGO.find({ NGO_registration_number: req.body["NGORegistrationNumber"] });
            // to make sure that ngo registration number are unique
            if (uniqueRegistrationNumber.length == 0) {
                // find co-ordinates to given ngo address
                if (req.body["NGORange"] > 0) {
                    await geocode(req.body["NGOAddress"])
                        .then((response) => {
                            // encrypting the password
                            bcrypt.hash(req.body["NGOPassword"], saltRounds, async (err, hashedPassword) => {
                                if (err) {
                                    res.render("signUpNGO.ejs", { error: "Sign up failed. Try again." });
                                }
                                // if req.body contains 'currLoc': this means co-ordinates are reliable
                                // else: this means address inside textarea is reliable

                                let newNGO = new NGO({
                                    name: req.body["NGOName"],
                                    email: req.body["NGOEmail"],
                                    NGO_registration_number: req.body["NGORegistrationNumber"],
                                    NGO_address: {
                                        humanReadableAddress: req.body.currLoc ? req.body["NGOAddressCalc"] : req.body["NGOAddress"],
                                        coordinates: req.body.currLoc ? JSON.parse(req.body["NGOCoordinates"]) : (req.body["NGOCoordinates"] === "" ? response : req.body["NGOCoordinates"]),
                                        reliable: req.body.currLoc ? 1 : 0
                                    },
                                    NGO_range: req.body["NGORange"],
                                    NGO_sectors: req.body["NGOSectors"],
                                    NGO_webpage: req.body["NGOWebpage"],
                                    NGO_password: hashedPassword,
                                    NGO_date_of_joining: dateOfJoining(),
                                    NGO_isVerified: false
                                });
                                // saving new ngo details in DB
                                newNGO.save()
                                    .then(result => {
                                        // these values will be used as display values on all other pages
                                        req.session.userID = req.body["NGOEmail"];
                                        req.session.userName = req.body["NGOName"];
                                        req.session.type = "ngo";
                                        req.flash("success", `Sign up successful. <a href='/profile/ngo/${req.body["NGOName"]}'>View profile</a>.`);
                                        res.redirect("/");
                                    })
                                    .catch(error => {
                                        console.log("Error saving ngo data: ", error);
                                        req.flash("error", "Server side error. Try again.");
                                        res.redirect("/signUpNGO");
                                    });
                            });
                        });
                } else {
                    res.render("signUpNGO.ejs", { error: "Invalid range." });
                }
            } else {
                req.flash("error", "NGO with same registration number already exists. <a href='/signInNGO'>Log in</a>.");
                res.redirect("/signUpNGO");
            }
        } else {
            req.flash("error", "NGO with same e-mail id already exists. <a href='/signInNGO'>Log in</a>.");
            res.redirect("/signUpNGO");
        }
    } else {
        res.render("signUpNGO.ejs", { error: "Invalid e-mail." });
    }
});

router.get("/signInNGO", (req, res) => {
    if (req.session.type || req.session.userID || req.session.userName) {
        res.redirect("/");
    } else {
        res.render("signInNGO.ejs", { error: null });
    }
});

router.post("/signInNGO", (req, res) => {
    let { NGOEmail, NGORegistrationNumber, NGOPassword } = req.body;
    // to check for valid email
    if (regexEmail.test(NGOEmail)) {
        // to find ngo corresponding to given email
        NGO.findOne({ email: NGOEmail, NGO_registration_number: NGORegistrationNumber })
            .then(ngo => {
                if (ngo) {
                    bcrypt.compare(NGOPassword, ngo.NGO_password, (err, result) => {
                        if (err) {
                            res.render("signInNGO.ejs", { error: "Sign in failed. Try again." });
                        }
                        if (result) {
                            // these values will be used as display values on other pages
                            req.session.userID = NGOEmail;
                            req.session.userName = ngo.name;
                            req.session.type = "ngo";
                            res.redirect("/");
                        } else {
                            res.render("signInNGO.ejs", { error: "Incorrect password." });
                        }
                    });
                } else {
                    req.flash("error", "NGO not found. <a href='/signUpNGO'>Create an account</a>.");
                    res.redirect("/signInNGO");
                }
            })
            .catch(err => {
                console.log("Error retrieving ngo detail: ", error);
                req.flash("error", "Server side error. Try again.");
                res.redirect("/signInNGO");
            });
    } else {
        res.render("signInNGO.ejs", { error: "Invalid email." })
    }
});

module.exports = router;