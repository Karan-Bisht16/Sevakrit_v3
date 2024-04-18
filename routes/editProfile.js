const express = require("express");
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
    if (req.session.userID && req.session.type === "user") {
        try {
            let data = await User.findById(id);
            res.render("editProfile.ejs", { user: data.name, type: "user", data });
        } catch (error) {
            let message = "Error finding user. <a href='/signIn'>Log in</a> or <a href='/signUp'>create an account</a>."
            req.flash("error", message);
            res.redirect("/");
        }
    } else if (req.session.userID && req.session.type === "ngo") {
        try {
            let data = await NGO.findById(id);
            res.render("editProfile.ejs", { user: data.name, type: "ngo", data });
        } catch (error) {
            let message = "Error finding NGO. <a href='/signInNGO'>Log in</a> or <a href='/signUpNGO'>create an account</a>."
            req.flash("error", message);
            res.redirect("/");
        }
    } else {
        let message = "Invalid user type. <a href='/signIn'>Log in</a> or <a href='/signUp'>create an account</a>."
        req.flash("error", message);
        res.redirect("/");
    }
});

router.patch("/editProfile/:id", async (req, res) => {
    let { id } = req.params;
    if (req.session.userID && req.session.type === "user") {
        try {
            let { name, user_mobile_number, email } = req.body;
            await User.findByIdAndUpdate(id, { name, user_mobile_number, email });
            req.flash("success", `Successfully updated profile! <a href='/'>Return home</a>.`);
            res.redirect(`/profile/user/${name}`);
        }
        catch (error) {
            req.flash("error", "Failed to update profile. Try again.")
            res.redirect(`/editProfile/${id}`);
        }
    } else if (req.session.userID && req.session.type === "ngo") {
        try {
            let { name, NGO_range, NGO_sectors, NGO_webpage } = req.body;
            await NGO.findByIdAndUpdate(id, { name, NGO_range, NGO_sectors, NGO_webpage });
            req.flash("success", `Successfully updated profile! <a href='/'>Return home</a>.`);
            res.redirect(`/profile/ngo/${name}`);
        }
        catch (error) {
            req.flash("error", "Failed to update profile. Try again.")
            res.redirect(`/editProfile/${id}`);
        }
    } else {
        let message = "Invalid user type. <a href='/signIn'>Log in</a> or <a href='/signUp'>create an account</a>."
        req.flash("error", message);
        res.redirect("/");
    }
})

module.exports = router;