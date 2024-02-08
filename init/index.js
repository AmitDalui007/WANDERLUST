const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = "mongodb+srv://daluiamit19:DJy7jqApfdkfl4XZ@cluster0.gon50bz.mongodb.net/?retryWrites=true&w=majority";


main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj)=>({
    ...obj,
    owner: "65a55d63f27a19ce4fa64e9d",
  }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();