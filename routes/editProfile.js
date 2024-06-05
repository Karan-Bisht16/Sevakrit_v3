const express = require("express");
const User = require("../models/user");
const NGO = require("../models/ngo");
const Admin = require("../models/admin");

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
            res.render("editProfile.ejs", { user: req.session, data });
        } catch (error) {
            req.flash("error", "Error finding user. <a href='/signIn'>Log in</a> or <a href='/signUp'>create an account</a>.");
            res.redirect("/");
        }
    } else if (req.session.userID && req.session.type === "ngo") {
        try {
            let data = await NGO.findById(id);
            res.render("editProfile.ejs", { user: req.session, data });
        } catch (error) {
            console.log("Error fetching ngos detail: ", error);
            req.flash("error", "Error finding NGO. <a href='/signInNGO'>Log in</a> or <a href='/signUpNGO'>create an account</a>.");
            res.redirect("/");
        }
    } else {
        req.flash("error", "Invalid user type. <a href='/signIn'>Log in</a> or <a href='/signUp'>create an account</a>.");
        res.redirect("/");
    }
});

router.patch("/editProfile/:id", async (req, res) => {
    let { id } = req.params;
    if (req.session.userID && req.session.type === "user") {
        try {
            let { name, user_mobile_number, email } = req.body;
            await User.findByIdAndUpdate(id, { name, user_mobile_number, email });
            req.session.userName = name;
            req.flash("success", "Successfully updated profile! <a href='/'>Return home</a>.");
            res.redirect(`/profile/user/${name}`);
        }
        catch (error) {
            console.log("Error updating user detail: ", error);
            req.flash("error", "Failed to update profile. Try again.")
            res.redirect(`/editProfile/${id}`);
        }
    } else if (req.session.userID && req.session.type === "ngo") {
        try {
            let { name, NGO_range, NGO_sectors, NGO_webpage } = req.body;
            await NGO.findByIdAndUpdate(id, { name, NGO_range, NGO_sectors, NGO_webpage });
            req.session.userName = name;
            req.flash("success", "Successfully updated profile! <a href='/'>Return home</a>.");
            res.redirect(`/profile/ngo/${name}`);
        }
        catch (error) {
            console.log("Error updating ngo detail: ", error);
            req.flash("error", "Failed to update profile. Try again.")
            res.redirect(`/editProfile/${id}`);
        }
    } else {
        req.flash("error", "Invalid user type. <a href='/signIn'>Log in</a> or <a href='/signUp'>create an account</a>.");
        res.redirect("/");
    }
});

router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
    if (req.session.userID == id) {
        try {
            if (req.session.type === "user") {
                await User.findOneAndDelete({ email: id });
                if (req.session.isAdmin) {
                    await Admin.findOneAndDelete({ admin_email: req.session.userEmail });
                }
            } else if (req.session.type === "ngo") {
                await NGO.findByIdAndDelete(id);
            }
            req.session.destroy(err => {
                if (err) {
                    console.error("Session destruction error:", err);
                    return;
                }
                res.clearCookie("connect.sid");
                res.redirect("/");
            });
        } catch (error) {
            console.log("Error deleting user: " + error);
        }
    } else {
        req.flash("error", "Invalid user ID.");
        res.redirect(`/profile/${req.session.type}/${req.session.userName}`)
    }
});

module.exports = router;