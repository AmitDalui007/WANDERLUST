const express = require("express");
const router = express.Router();
const Listing=require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("../schema.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage });

const listingController = require("../controllers/listings.js");

//index route
//router.get("/", wrapAsync(listingController.indexListing));
//Create Route
//router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing));

//index + create route using router.route() cause all path are same "/";
router
   .route("/")
   .get(wrapAsync(listingController.indexListing))
   .post(isLoggedIn, upload.single("listing[image]"), 
      validateListing, 
      wrapAsync(listingController.createListing)
   );

//new route
router.get("/new", isLoggedIn, listingController.newListingForm);

//show route
//router.get("/:id", isLoggedIn, wrapAsync(listingController.showListing));
//Update Route
//router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));
//Delete Route
//router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//show + update + delete using router.route() cause all path are same "/:id";
router
   .route("/:id")
   .get(isLoggedIn, 
      wrapAsync(listingController.showListing)
   )
   .put(isLoggedIn, 
      isOwner, 
      upload.single("listing[image]"), 
      validateListing, 
      wrapAsync(listingController.updateListing)
   )
   .delete(isLoggedIn, 
      isOwner, 
      wrapAsync(listingController.destroyListing)
   );

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListingForm));

module.exports = router;