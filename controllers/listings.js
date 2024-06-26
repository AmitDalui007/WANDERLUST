const Listing=require("../models/listing.js");
// const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
// const mapToken = process.env.MAP_TOKEN;
// const baseClient = mbxGeocoding({ accessToken: mapToken });

module.exports.indexListing = async(req,res)=>{
    const allListings = await Listing.find({});
    //console.log(allListings);
    res.render("listings/index.ejs",{allListings});
};

module.exports.newListingForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
      .populate({
       path: "review",
       populate:{
        path: "author"
      }
    }).populate("owner");
    if(!listing){
      req.flash("error","Listing does not exit");
      res.redirect("/listings");
    }
    //console.log(listing);
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing = async (req, res, next) => {
    //let {title,description,price,Country,location}= req.body; 
    //to write this code into small format, we are using key-value pair of listing[] in new.ejs file.
    // if(!req.body.listing){
    //   throw new ExpressError(400,"Send valid data for listings");
    // }
    // let response = await geocodingClient.forwardGeocode({
    //   query: req.body.listing.location,
    //   limit: 2
    // })
    // .send();

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    
    //newListing.geometry = response.body.features[0].geometry;
    
    await newListing.save();
    req.flash("success","New Listing created!");
    res.redirect("/listings");
    //console.log(newListing);
};

module.exports.editListingForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
      req.flash("error","Listing does not exit");
      res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !== "undefined"){
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = {url, filename};
      await listing.save();
    }
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted!");
    //console.log(deletedListing);
    res.redirect("/listings");
};
