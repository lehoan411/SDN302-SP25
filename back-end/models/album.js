// models/Album.js
const mongoose = require('mongoose');

const AlbumSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    wallpapers: [
        { type: mongoose.Schema.Types.ObjectId, ref: "wallpaper" }
    ],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
}, { timestamps: true });

const Album = mongoose.model('album', AlbumSchema);
module.exports = Album;
