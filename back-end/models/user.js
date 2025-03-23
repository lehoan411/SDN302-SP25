// models/user.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  roles: {
    type: String,
    enum: ["user", "admin", "user Vip"],
    default: "user",
  },
  bio: {
    type: String,
  },
  avatar: {
    type: String,
  },
  albums: [{ type: mongoose.Schema.Types.ObjectId, ref: "album" }], 
  dob: {
    type: Date,
  },
  favorited: [{ type: mongoose.Schema.Types.ObjectId, ref: "wallpaper" }],
  status:{
    type: String,
    enum: ["active", "inactive"],
  }
});

const User = mongoose.model("user", UserSchema);
module.exports = User;
