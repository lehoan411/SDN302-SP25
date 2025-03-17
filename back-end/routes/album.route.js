const express = require("express");
const bodyParser = require("body-parser");
const { checkUserJWT } = require("../middlewares/JsonWebToken");
const AlbumRouter = express.Router();
const db = require("../models");
const mongoose = require("mongoose");
const cloudinary = require("../configs/cloudinary");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

AlbumRouter.use(bodyParser.json());

// Cấu hình upload file
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "uploads");
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + path.extname(file.originalname));
        }
    }),
});

// ✅ Lấy tất cả album
AlbumRouter.get("/", async (req, res) => {
    try {
        const albums = await db.album.find().populate("wallpapers").populate("author");
        res.status(200).json(albums);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ✅ Lấy album theo ID
AlbumRouter.get("/:albumId", async (req, res) => {
    const { albumId } = req.params;
    try {
        const album = await db.album.findById(albumId).populate("wallpapers").populate("author");
        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }
        res.status(200).json(album);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ✅ Tạo album mới (Lấy userId từ token)
AlbumRouter.post("/create", checkUserJWT, upload.single("albumImage"), async (req, res) => {
    try {
        const { albumName } = req.body;
        const userId = req.user.userId; // Lấy userId từ token
        let albumImage = "";

        if (!albumName) {
            return res.status(400).json({ message: "Album name is required" });
        }

        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path);
                if (result && result.secure_url) {
                    albumImage = result.secure_url;
                    fs.unlink(req.file.path, () => {});
                } else {
                    return res.status(500).json({ message: "Failed to upload image" });
                }
            } catch (error) {
                return res.status(500).json({ message: "Image upload error" });
            }
        }

        const newAlbum = await db.album.create({
            albumName,
            albumImage,
            author: new mongoose.Types.ObjectId(userId),
        });

        await db.user.findByIdAndUpdate(userId, { $push: { albums: newAlbum._id } });

        res.status(201).json({ message: "Album created successfully", album: newAlbum });
    } catch (error) {
        res.status(500).json({ message: "Failed to create album" });
    }
});

// ✅ Chỉnh sửa album (Lấy userId từ token)
AlbumRouter.put("/:albumId/edit-album", checkUserJWT, upload.single("albumImage"), async (req, res) => {
    try {
        console.log("Req file:", req.file);
        const { albumName } = req.body;
        const { albumId } = req.params;
        const userId = req.user.userId; // Lấy userId từ token
        const album = await db.album.findById(albumId);

        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }

        if (album.author.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized: You can only edit your own albums" });
        }

        let newAlbumImage = album.albumImage;

        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path);
                if (result && result.secure_url) {
                    newAlbumImage = result.secure_url;
                    fs.unlink(req.file.path, () => {});
                } else {
                    return res.status(500).json({ message: "Failed to upload image" });
                }
            } catch (error) {
                return res.status(500).json({ message: "Image upload error" });
            }
        }

        const updatedAlbum = await db.album.findByIdAndUpdate(
            albumId,
            { $set: { albumName, albumImage: newAlbumImage } },
            { new: true }
        );

        res.status(200).json({ message: "Album updated successfully", album: updatedAlbum });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Xóa album (Lấy userId từ token)
AlbumRouter.delete("/:albumId/delete", checkUserJWT, async (req, res) => {
    const { albumId } = req.params;
    const userId = req.user.userId;
    try {
        const album = await db.album.findById(albumId);
        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }

        if (album.author.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized: You can only delete your own albums" });
        }

        await db.album.findByIdAndDelete(albumId);
        await db.wallpaper.deleteMany({ fromAlbum: albumId });
        await db.user.findByIdAndUpdate(album.author, { $pull: { albums: albumId } });

        res.status(200).json({ message: "Album deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = AlbumRouter;
