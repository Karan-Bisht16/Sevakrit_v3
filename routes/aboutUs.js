const express = require("express");

const router = express.Router();

router.get("/aboutUs", (req, res) => {
    if (req.session.userName && req.session.userID) {
        if (req.session.type === 'user' || req.session.type === "ngo") {
            res.render("aboutUs.ejs", { user: req.session.userName, type: req.session.type });
        } else {
            res.redirect("/", { error: "Invalid user. Please sign-in again." });
        }
    } else {
        res.render("aboutUs.ejs");
    }
});

module.exports = router;