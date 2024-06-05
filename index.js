// to set path for 'views' and 'public'
const path = require("path")
const express = require("express");
// to maintain a session
const session = require("express-session");
// to implement environment variables
require("dotenv").config();
// to implement flash messages
const flash = require("connect-flash");
var methodOverride = require("method-override");

const app = express();
const PORT = 1600;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// to make use of mongoDB
const mongoose = require("mongoose");
const connection = require("./database");
connection();

// storing sessions in mongoDB
const MongoStore = require("connect-mongo");
const mongoStore = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions",
    mongooseConnection: mongoose.connection,
    ttl: 365 * 24 * 60 * 60,
    autoRemove: 'native'
});

app.use(session({
    secret: process.env.SessionSecret,
    resave: false,
    saveUninitialized: false,
    store: mongoStore,
    cookie: { 
        maxAge: 365 * 24 * 60 * 60 * 1000
    }
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    next()
})

const home = require("./routes/home");
app.use(home);
const donate = require("./routes/donate");
app.use(donate);
const aboutUs = require("./routes/aboutUs");
app.use(aboutUs);
const feedback = require("./routes/feedback");
app.use(feedback);
const registeredNGO = require("./routes/registeredNGO");
app.use(registeredNGO);
const nearbyDonations = require("./routes/nearbyDonations");
app.use(nearbyDonations);
const ngoAuthentication = require("./routes/ngoAuthentication");
app.use(ngoAuthentication);
const userAuthentication = require("./routes/userAuthentication");
app.use(userAuthentication);
const profile = require("./routes/profile");
app.use(profile);
const editProfile = require("./routes/editProfile");
app.use(editProfile);
const admin = require("./routes/admin");
app.use(admin);

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Session destruction error:", err);
            return;
        }
        res.clearCookie("connect.sid");
        res.redirect("/");
    });
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});