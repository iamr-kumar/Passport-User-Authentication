// This application logs in a user using passport js local authentication strategy (username or email and password)
// and then on successful authentication, redirects the user to a covid19 dashboard containing the current global
// as well as the Indian summary. I have not much focussed on the styling part and have used simple Bootstrap classes 
// to make the application presentable.



const express = require('express'),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose'),
      passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy,
      User = require('./models/user'),
      flash = require("connect-flash");


const indexRoutes = require('./routes/index');


// Mongoose Setup

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect("mongodb+srv://iamzacker:iamzacker@passport-authentication.tzl7u.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority")
    .then(() => console.log("Connection successful!"))
    .catch((err) => console.log(err));

// Mongoose Setup

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");


app.use(require("express-session")({
    secret: "Nothing new is happening",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(indexRoutes);


var port = process.env.PORT;
if(port == null || port == ""){
    port = 3000;
}

app.listen(port, () => {
    console.log("Server started!");
});