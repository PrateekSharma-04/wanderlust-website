const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const usersController = require("../controllers/users.js"); // conatins all callbacks

router.route("/signup")
    .get(usersController.renderSignupForm) // signup form route
    .post(wrapAsync(usersController.signup)); // signup route

router.route("/login")
    .get(usersController.renderLoginForm) // login form route
    .post(saveRedirectUrl, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), usersController.login); // login route

// logout route
router.get("/logout", usersController.logout);

module.exports = router;