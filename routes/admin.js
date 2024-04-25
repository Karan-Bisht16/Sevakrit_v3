const express = require("express");
const NGO = require("../models/ngo");
const User = require('../models/user');
const Admin = require('../models/admin');
const Review = require('../models/review');
// const passport = require("passport");
const { adminLoggedIn } = require("../loginMiddleware");

const router = express.Router()

// admin signup
// router.get("/admin-register", (req, res) => {
//     res.render("adminSignup");
// })

// router.post("/admin-register", async (req, res) => {
//     let { username, password, email, role, gender } = req.body
//     let admin = new Admin({ username, email, gender, role })
//     let newAdmin = await Admin.register(admin, password)
//     res.redirect("/admin_login");
// })

//admin login
// router.get("/admin_login", (req, res) => {
//     res.render("adminLogin")
// })

//admin post request for login if its fail it will redirect too same login page
// and if it successs than you automatically go too the home router
// router.post('/admin_login',
//     passport.authenticate('local', { failureRedirect: '/admin_login', failureMessage: true }),
//     function (req, res) {
//         req.flash("success", "Welcome back sir")
//         res.redirect("/adminHome");
//     }
// );

//logout
// router.get('/admin_logout', function (req, res, next) {
//     req.logout(() => {
//         req.flash("success", "Logout successfully")
//         res.redirect('/admin_login');
//     });
// });

//show data to the dashboard
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

//show data to the Home
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

// //view a particular  ngo profile
router.get("/adminview/:id", adminLoggedIn, async (req, res) => {
    try {
        let { id } = req.params;
        const ngoParticular = await NGO.findById(id);
        res.render("adminView", { ngoParticular });
    }
    catch (error) {
        console.log(error);
    }
})

// //edit the ngo  details 
router.get("/adminedit/:id", adminLoggedIn, async (req, res) => {
    try {
        let { id } = req.params;
        const ngoParticular = await NGO.findById(id);
        res.render("adminEdit", { ngoParticular });
    }
    catch (error) {
        console.log(error);
    }
})

// router.patch("/adminedit/:id", isLoggedIn, async (req, res) => {
//     try {
//         await NGO.findByIdAndUpdate(req.params.id, {
//             name: req.body.name,
//             email: req.body.email,
//             NGO_registration_number: req.body.NGO_registration_number,
//             NGO_address: req.body.NGO_address,
//             NGO_range: req.body.NGO_range,
//             NGO_date_of_joining: req.body.NGO_date_of_joining,
//             NGO_sectors: req.body.NGO_sectors
//         });
//         res.redirect(`/adminedit/${req.params.id}`)
//     }
//     catch (error) {
//         console.log(error);
//     }
// })

// //delete a ngo data which are not give the required documnents 
// router.delete("/adminedit/:id", isLoggedIn, async (req, res) => {
//     try {
//         let { id } = req.params;
//         await NGO.findByIdAndDelete(id)
//         res.redirect("/adminDashboard")
//     }
//     catch (error) {
//         console.log(error)
//     }
// })

// //search  for ngo by name
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

module.exports = router