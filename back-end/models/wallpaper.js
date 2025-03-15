const mongoose = require('mongoose');

const WallpaperSchema = new mongoose.Schema({
    description: {
        type: String,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    tags: [
        {
            type: String,
            required: true,
        }
    ],
    fromAlbum: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "album"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',

    },
    likes: {
        type: Number,
        default: 0,
    },
    comments: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
            body: String,
            date: { type: Number, default: Date.now() },
        }
    ],
}, { timestamps: true });

const Wallpaper = mongoose.model("wallpaper", WallpaperSchema);

module.exports = Wallpaper;
