const express = require("express");

const router = express.Router();

router.get("/aboutUs", (req, res) => {
    console.log(req.session);
    if (req.session.userName && req.session.userID) {
        if (req.session.type === "user" || req.session.type === "ngo") {
            res.render("aboutUs.ejs", { user: req.session });
        } else {
            req.flash("error", "Server memory error. Refresh to resolve.")
            res.redirect("/");
        }
    } else {
        res.render("aboutUs.ejs");
    }
});

module.exports = router;