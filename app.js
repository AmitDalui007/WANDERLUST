if(process.env.NODE_ENV !="production"){
    require("dotenv").config();
}

const express=require("express");
const mongoose=require("mongoose");
const app= express();
const port= 8080 || process.env.PORT;
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


//const MONGO_URL= "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main()
.then((res)=>{
    console.log("connect to DB");
}).catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error",()=>{
    console.log("Error in Mongo Session Store", err);
});

const sessionOptions = {
    store: store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};


// app.get("/",(req,res)=>{
//     res.send("Route is working");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=> {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

//add fake user
// app.get("/demouser", async(req, res)=>{
//     let fakeUser = new User({
//         email: "abc@gmail.com",
//         username: "delta-user",
//     });
//     let registeredUser = await User.register(fakeUser,"123456789");
//     res.send(registeredUser);
// })



//use express router
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// app.get("/testListing",async(req,res)=>{
//     let sampleListing = new Listing({
//         title:"My new villa",
//         description:"By the beach",
//         image:"https://images.unsplash.com/photo-1532517891316-72a08e5c03a7?q=80&w=1530&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//         price:12000,
//         location:"Calangute, Goa",
//         Country:"India",
//     });

//     await sampleListing.save();
//     console.log("Save to DB");
//     console.log(sampleListing);
//     res.send("Success");
// });

app.all("*", (req,res,next)=>{
  next(new ExpressError(404,"page not found!"));
})

app.use((err, req, res, next)=>{
    let{statusCode=500, messsage="Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{err})
    //res.status(statusCode).send(messsage);
})

app.listen(port,()=>{
    console.log("app is listening on 8080");
});
