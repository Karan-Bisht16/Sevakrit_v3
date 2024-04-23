const generalUserLoggedIn = (req, res, next) => {
    if (req.session.userName && req.session.userID) {
        return next();
    } else {
        req.flash("error", "Please log in first");
        return res.redirect("/");
    }
};

const userLoggedIn = (req, res, next) => {
    if (req.session.userName && req.session.userID) {
        if (req.session.type === "user") {
            return next();
        } else {
            req.flash("error", "Access requires user registration.");
            return res.redirect("/signUp");
        }
    } else {
        req.flash("error", "<a href='/signIn'>Log in</a> or <a href='/signUp'>create an account</a>.");
        return res.redirect("/signUp");
    }
}

const ngoLoggedIn = (req, res, next) => {
    if (req.session.userName && req.session.userID) {
        if (req.session.type === "ngo") {
            return next();
        } else {
            req.flash("error", "Access requires NGO registration.");
            return res.redirect("/signUpNGO");
        } 
    } else {
        req.flash("error", "<a href='/signIn'>Log in</a> or <a href='/signUp'>create an account</a>.");
        return res.redirect("/signUpNGO");
    }
}

const adminLoggedIn = (req, res, next) => {
    if (req.session.userName && req.session.userID) {
        if (req.session.isAdmin) {
            return next();
        } else {
            req.flash("error", "Access denied.");
            return res.redirect("/");
        }
    } else {
        req.flash("error", "<a href='/signIn'>Log in</a> or <a href='/signUp'>create an account</a>.");
        return res.redirect("/");
    }
}

module.exports = { generalUserLoggedIn, userLoggedIn, ngoLoggedIn, adminLoggedIn };