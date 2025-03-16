const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
}, { timestamps: true });

let Tag = mongoose.model("tag", TagSchema);

module.exports = Tag;
