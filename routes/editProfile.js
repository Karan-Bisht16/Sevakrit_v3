const express = require("express");
const flash = require("connect-flash");
const User = require("../models/user");
const NGO = require("../models/ngo");

const router = express.Router();

// since we do not have the '_id' stored in session thus whenever the 'Edit Profile' option is clicked in header
// we have to come to this route to find '_id' from DB using 'req.session.userID' 
router.get("/edit-profile", async (req, res) => {
    if (req.session.userName && req.session.userID) {
        if (req.session.type === "user") {
            await User.findOne({ email: req.session.userID })
                .then(result => {
                    res.redirect(`/editProfile/${result._id}`);
                }).catch(error => {
                    console.log("Error finding user: ", error);
                    res.redirect("/");
                });
        } else if (req.session.type === "ngo") {
            await NGO.findOne({ email: req.session.userID })
                .then(result => {
                    res.redirect(`/editProfile/${result._id}`);
                }).catch(error => {
                    console.log("Error finding ngo: ", error);
                    res.redirect("/");
                });
        } else {
            console.log("Invalid user type: ", error);
            res.redirect("/");
        }
    } else {
        res.render("signUp.ejs", { error: null });
    }
});
router.get("/editProfile/:id", async (req, res) => {
    let { id } = req.params;
    let userData = await User.findById(id);
    if (req.session.userID && req.session.type === "user") {
        User.findOne({ email: req.session.userID })
            .then(result => {
                res.render("editProfile.ejs", { user: result.name, userData, type: req.session.type });
            })
            .catch(error => {
                console.log("Error finding user: ", error);
                res.redirect("/");
            });
    } else if (req.session.userID && req.session.type === "ngo") {
        NGO.findOne({ email: req.session.userID })
            .then(result => {
                res.render("edit.ejs", { user: result.name, userData, type: req.session.type });
            })
            .catch(error => {
                console.log("Error finding ngo: ", error);
                res.redirect("/");
            });
    } else {
        res.redirect("/");
    }
});

router.patch("/editProfile/:id", async (req, res) => {
    try {
        let { id } = req.params;
        let { name, user_mobile_number, email } = req.body;

        await User.findByIdAndUpdate(id, { name, user_mobile_number, email });
        req.flash("success", `Successfully updated profile! `)
        res.redirect(`/editProfile/${id}`);
    }
    catch (error) {
        req.flash("error", "Failed to update profile. Try again.")
    }
})

module.exports = router;