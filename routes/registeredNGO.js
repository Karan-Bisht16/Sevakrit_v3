const express = require("express");
const NGO = require("../models/ngo");

const router = express.Router();

router.get("/registeredNGO", async (req, res) => {
    let NGOs = await NGO.find();
    if (req.session.userName && req.session.userID) {
        if (req.session.type === "user" || req.session.type === "ngo") {
            res.render("registeredNGO.ejs", { user: req.session, NGOData: NGOs });
        } else {
            req.flash("error", "Server memory error. Refresh to resolve.")
            res.redirect("/");
        }
    } else {
        res.render("registeredNGO.ejs", { NGOData: NGOs });
    }
});

module.exports = router;