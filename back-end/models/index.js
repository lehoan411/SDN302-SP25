const mongoose = require("mongoose");
const User = require("./user");
const Tag = require("./tag");
const Album = require("./album");
const Wallpaper = require("./wallpaper");
const Report = require("./report");


const db = {};

db.user = User;
db.tag = Tag;
db.album = Album;
db.wallpaper = Wallpaper;
db.report = Report;

//Ket noi CSDL
db.connectDB = async () => {
  try{
      await mongoose.connect(process.env.MONGODB_URI)
          .then(() => console.log("Connected to MongoDB"));

  } catch(err) {
      next(err)
      process.exit();
  }
  
}

module.exports = db;
