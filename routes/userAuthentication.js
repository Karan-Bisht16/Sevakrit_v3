const express = require("express");
// to encrypt passwords
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const User = require("../models/user");

const router = express.Router();

const regexEmail = /^([a-zA-Z0-9_\.\-]+)@([a-zA-Z0-9_\.\-]+)\.([a-zA-Z]+)/;
const regexMobile = /^[7-9]([0-9]){9}$/;

function dateOfJoining() {
    const date = new Date;
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
}

router.get("/signUp", (req, res) => {
    if (req.session.type || req.session.userID || req.session.userName) {
        res.redirect("/");
    } else {
        res.render("signUp.ejs", { error: null });
    }
});

router.post('/signUp', async (req, res) => {
    let { userName, userEmail, userMobile, userPassword } = req.body;
    // to check for valid email
    if (regexEmail.test(userEmail)) {
        // to check for valid mobile no.
        if (regexMobile.test(userMobile)) {
            let users = await User.find({ email: userEmail });
            // to make sure that all registered emails are unique
            if (users.length == 0) {
                // encrypting user password
                bcrypt.hash(userPassword, saltRounds, (err, hashedPassword) => {
                    if (err) {
                        res.render("signUp.ejs", { error: "Sign up failed. Try again." });
                    }
                    let newUser = new User({
                        name: userName,
                        email: userEmail,
                        user_mobile_number: userMobile,
                        user_password: hashedPassword,
                        user_date_of_joining: dateOfJoining(),
                        user_isTrusted: false
                    });
                    // saving new user details in DB
                    newUser.save()
                        .then(result => {
                            // these values will be used as display values on all other pages
                            req.session.userID = userEmail;
                            req.session.userName = userName;
                            req.session.type = 'user';
                            console.log("[POST] `/signUp`", req.session.userID);
                            res.redirect('/');
                        })
                        .catch(error => {
                            console.log("Error saving user data: ", error);
                            res.render('/signUp', { error: "Sign up failed. Try again." });
                        });
                });
            } else {
                res.render("signUp.ejs", { error: "User already exists. Try logging in." })
            }
        } else {
            res.render("signUp.ejs", { error: 'Invalid mobile number.' });
        }
    } else {
        // Quality of Life Change: send back form data to autofill those fields that were valid to begin with
        // res.render("signUp.ejs", { error: 'Invalid email.', formData: req.body, errorField : 1 });
        res.render("signUp.ejs", { error: 'Invalid email.' });
    }
});

router.get('/signIn', (req, res) => {
    if (req.session.type || req.session.userID || req.session.userName) {
        res.redirect("/");
    } else {
        res.render("signIn.ejs", { error: null });
    }
});

router.post('/signIn', async (req, res) => {
    let { userEmail, userPassword } = req.body;
    // to check for valid email
    if (regexEmail.test(userEmail)) {
        // to find user corresponding to given email
        User.findOne({ email: userEmail })
            .then(user => {
                if (user) {
                    bcrypt.compare(userPassword, user.user_password, (err, result) => {
                        if (err) {
                            res.render("signIn.ejs", { error: "Sign in failed. Try again." });
                        }
                        if (result) {
                            // these values will be used as display values on other pages
                            req.session.userID = userEmail;
                            req.session.userName = user.name;
                            req.session.type = 'user';
                            res.redirect('/');
                        } else {
                            res.render('signIn.ejs', { error: 'Incorrect password.' });
                        }
                    });
                } else {
                    res.render('signIn.ejs', { error: 'User not found.' });
                }
            })
            .catch(err => {
                res.render("signIn.ejs", { error: "Error finding user." });
            });
    } else {
        res.render("signIn.ejs", { error: 'Invalid email.' })
    }
});

module.exports = router;