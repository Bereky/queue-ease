const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const passport = require("passport");

const authenticateUser = (email, password, done) => {
  User.findOne({ email: email }, (err, user) => {
    if (err) throw err;
    if (!user) return done(null, false);
    bcrypt.compare(password, user.password || "", (err, result) => {
      if (err) return err;
      if (result === true) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  });
};

// Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    authenticateUser
  )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
  User.findOne({ _id: id }, (err, user) => {
    const userInformation = {
      email: user.email,
    };
    done(err, userInformation);
  });
});
