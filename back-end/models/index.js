const mongoose = require("mongoose");
const User = require("./user");
const Tag = require("./tag");
const Album = require("./album");
const Wallpaper = require("./wallpaper");
const Report = require("./report");

mongoose.Promise = global.Promise;

const db = {};

db.user = User;
db.tag = Tag;
db.album = Album;
db.wallpaper = Wallpaper;
db.report = Report;

const connectDB = async () => {
  await mongoose
    .connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME,
    })
    .then(() => console.log("Connected to Mongodb"))
    .catch((error) => {
      console.log(error.message);
      process.exit();
    });
};

db.connect = connectDB;

module.exports = db;
