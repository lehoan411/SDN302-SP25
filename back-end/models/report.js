// models/Album.js
const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    reason: {
      type: String,
      required: true,
    },
    wallpaper: { type: mongoose.Schema.Types.ObjectId, ref: "wallpaper", required: true },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("report", ReportSchema);
module.exports = Report;
