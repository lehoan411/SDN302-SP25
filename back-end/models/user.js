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
  },
  roles: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  bio: {
    type: String,
    require: false,
  },
  avatar: {
    type: String,
    require: false,
  },
  albums: [{ type: mongoose.Schema.Types.ObjectId, ref: "album" }], 
  dob: {
    type: Date,
    require: false,
  },
  status:{
    type: String,
    enum: ["active", "inactive"],
  }
});

const User = mongoose.model("user", UserSchema);
module.exports = User;
