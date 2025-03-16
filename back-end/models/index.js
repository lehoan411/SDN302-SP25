const mongoose = require("mongoose");
const User = require("./user");
const Album = require("./album");
const Wallpaper = require("./wallpaper");
const Report = require("./report");
const Role = require("./role"); 

const db = {};

db.user = User;
db.album = Album;
db.wallpaper = Wallpaper;
db.report = Report;
db.role = Role;

// Kết nối CSDL
db.connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1); // Thoát chương trình với mã lỗi
  }
};

module.exports = db;
