const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const request = require("request");

const router = express.Router();

router.get("/", (req, res) => {
    res.render("home");
});

router.get("/secret", isLoggedIn, (req, res) => {
    var url = "https://api.covid19api.com/summary";
    request(url, (err, response, body) => {
        if(!err && response.statusCode == 200){
            var data = JSON.parse(body);
            var IndiaData;
            data.Countries.forEach(country => {
                if(country.Country === 'India'){
                    IndiaData = country;
                }
            })
            res.render("secret", {data: data, IndiaData: IndiaData});
        }else{
            res.send("Some error occured!");
        }
    })
});

router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login",
    failureFlash: "Invalid username or password!"
}), (req, res) => {
});

router.get("/signup", (req, res) => {
    res.render("signup");
});

router.post("/signup", (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    // Check for password length
    if(password.length < 8){
        req.flash("error", "Password must be atleast 8 characters");
        return res.redirect("/signup");
    }
    else{
        // Look for an existing user
        User.findOne().or([{username: username}, {email: email}])
        .then(user => {
            if(user){
                req.flash("error", "User already exists");
                return res.redirect("/signup");
                console.log("Redirected!");
            }
            else{
                // Register the user
                User.register(new User({username: username, email: email}), password)
                    .then(user => {
                        passport.authenticate("local")(req, res, () => {
                            req.flash("success", "Signed you in!");
                            res.redirect("/secret");
                        })
                    })
                    .catch(err => {
                        req.flash("error", err.message);
                        console.log(err);
                        return res.redirect("/signup");
                    })
            }
        })
        .catch(err => {
            req.flash("error", err.message);
            return res.redirect("/signup");
        })
    }

    
});

// Logout User
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/");
});


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You are not logged in!");
    res.redirect("/login");
}

module.exports = router;