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
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "role" }],
  bio: {
    type: String,
    require: false,
  },
  avatar: {
    type: String,
    require: false,
  },
  notifications: [
    { body: { type: String }, link: { type: String }, isReaded: { type: Boolean, default: false }, date: { type: Number, default: Date.now() } }
  ],
  albums: [{ type: mongoose.Schema.Types.ObjectId, ref: "album" }],
  shared: [{ type: mongoose.Schema.Types.ObjectId, ref: "album" }],
  liked: [{ type: mongoose.Schema.Types.ObjectId, ref: "wallpaper" }],
  dob: {
    type: Date,
    require: false,
  },
  token: {
    type: String,
    require: true,
  },
  isActived: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model("user", UserSchema);
module.exports = User;
