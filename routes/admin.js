const express = require("express");
const NGO = require("../models/ngo");
const User = require('../models/user');
const Admin = require('../models/admin');
const Review = require('../models/review');
const { adminLoggedIn } = require("../loginMiddleware");

const router = express.Router()

// show data to the dashboard
router.get("/adminDashboard", adminLoggedIn, async (req, res) => {
    try {
        let NGOData = await NGO.find({});
        let UserData = await User.find({});
        let ReviewData = await Review.find({});
        res.render("adminDashboard.ejs", { user: req.session, NGOData, UserData, ReviewData });
    }
    catch (error) {
        console.log(error)
    }
});

router.patch("/adminDashboard/ngo/:id", adminLoggedIn, async (req, res) => {
    let { id } = req.params;
    try {
        let priorValue = await NGO.findById(id);
        await NGO.findByIdAndUpdate(id, { NGO_isVerified: !priorValue["NGO_isVerified"] });
        res.send({ status: true });
    } catch (error) {
        res.send({ status: false });
    }
});

// view a particular ngo
router.get("/adminView/ngo/:id", adminLoggedIn, async (req, res) => {
    try {
        let { id } = req.params;
        const ngoParticular = await NGO.findById(id);
        res.render("adminView.ejs", { ngoParticular, user: req.session });
    }
    catch (error) {
        console.log(error);
    }
})

// edit details of an ngo 
router.get("/adminEdit/ngo/:id", adminLoggedIn, async (req, res) => {
    try {
        let { id } = req.params;
        const ngoParticular = await NGO.findById(id);
        res.render("adminEdit", { ngoParticular, user: req.session });
    }
    catch (error) {
        console.log(error);
    }
})

router.patch("/adminEdit/:id", adminLoggedIn, async (req, res) => {
    try {
        let { id } = req.params;
        let ngo = await NGO.findById(id);
        await NGO.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            NGO_registration_number: req.body.NGO_registration_number,
            NGO_address: {
                humanReadableAddress: req.body.NGO_address,
                coordinates: {
                    latitude: ngo.NGO_address.coordinates.latitude,
                    longitude: ngo.NGO_address.coordinates.longitude
                }
            },
            NGO_range: req.body.NGO_range,
            NGO_date_of_joining: req.body.NGO_date_of_joining,
            NGO_sectors: req.body.NGO_sectors
        });
        req.flash("success", "Successfully updated profile! <a href='/adminDashboard'>Return to dashboard</a>.");
        res.redirect(`/adminView/ngo/${id}`)
    }
    catch (error) {
        console.log("Error updating NGO details [by admin]:", error);
        req.flash("error", "Error updating NGO. <a href='/adminDashboard'>Return to dashboard</a>.");
        res.redirect("/adminDashboard");
    }
})

// delete record of an ngo
router.delete("/adminEdit/:id", adminLoggedIn, async (req, res) => {
    try {
        let { id } = req.params;
        await NGO.findByIdAndDelete(id);
        req.flash("success", "Successfully deleted profile! <a href='/adminDashboard'>Return to dashboard</a>.");
        res.redirect("/adminDashboard");
    }
    catch (error) {
        console.log("Error deleting NGO [by admin]:", error);
        req.flash("error", "Error deleting NGO. <a href='/adminDashboard'>Return to dashboard</a>.");
        res.redirect("/adminDashboard");
    }
})

module.exports = router;

// show data to the Home
// router.get("/adminHome", adminLoggedIn, async (req, res) => {
//     try {
//         let user = req.user.username;
//         let foundNgo = await NGO.find({}).sort({ _id: -1 })
//         res.render("adminHome", { foundNgo, user });
//     }
//     catch (error) {
//         console.log(error)
//     }
// })

// add ngo to the database
// router.get("/addNgo", (req, res) => {
//     res.render("add")
// })

// router.post("/addNgo", async (req, res) => {
//     const newNgo = new NGO({
//         name: req.body.name,
//         email: req.body.email,
//         NGO_registration_number: req.body.NGO_registration_number,
//         NGO_address: req.body.NGO_address,
//         NGO_range: req.body.NGO_range,
//         NGO_date_of_joining: req.body.NGO_date_of_joining,
//         NGO_sectors: req.body.NGO_sectors
//     });
//     try {
//         await NGO.create(newNgo)
//         res.redirect("/adminDashboard")
//     }
//     catch (error) {
//         console.log(error)
//     }
// })

// search  for ngo by name
// router.post("/search", async (req, res) => {
//     try {
//         let raj = req.body.searchTerm.trim()
//         const searchNgo = await NGO.find(
//             {
//                 "$or": [
//                     { "name": { $regex: raj } },
//                     { "NGO_registration_number": { $regex: raj } }
//                 ]
//             }
//         )
//         res.render('search', { searchNgo })
//     }
//     catch (e) {
//         console.log(e);
//     }
// })