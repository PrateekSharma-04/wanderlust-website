const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedin, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js"); // contains every callback function
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
    .get(wrapAsync(listingController.index)) // index route
    .post(isLoggedin, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing)); // create route

//new route
router.get("/new", isLoggedin, listingController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(listingController.showListing)) // show route
    .put(isLoggedin, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))  // update route
    .delete(isLoggedin, isOwner, wrapAsync(listingController.destroyListing));  // delete route

//edit route
router.get("/:id/edit", isLoggedin, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;