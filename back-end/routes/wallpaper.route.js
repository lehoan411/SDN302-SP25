const express = require("express");
const bodyParser = require("body-parser");
const { checkUserJWT } = require("../middlewares/JsonWebToken");
const db = require("../models");
const cloudinary = require("../configs/cloudinary");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const WallpaperRouter = express.Router();
WallpaperRouter.use(bodyParser.json());

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

// ✅ Lấy tất cả ảnh
WallpaperRouter.get("/", async (req, res) => {
    try {
        const wallpapers = await db.wallpaper.find()
            .populate("createdBy")
            .populate("fromAlbum")
            .populate("comments.user");

        res.status(200).json(wallpapers);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ✅ Lấy ảnh theo ID
WallpaperRouter.get("/:wallpaperId", async (req, res) => {
    try {
        const wallpaper = await db.wallpaper.findById(req.params.wallpaperId)
            .populate("createdBy")
            .populate("fromAlbum")
            .populate("comments.user");

        if (!wallpaper) {
            return res.status(404).json({ message: "Wallpaper not found" });
        }

        res.status(200).json(wallpaper);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ✅ Tạo ảnh mới (Lấy userId từ token)
WallpaperRouter.post("/create", checkUserJWT, upload.single("imageUrl"), async (req, res) => {
    try {
        const { albumId, description, tags } = req.body;
        const userId = req.user.userId; // Lấy userId từ token
        let imageUrl = "";

        if (!albumId) {
            return res.status(400).json({ message: "Missing albumId" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No image file uploaded" });
        }

        try {


            // Tải ảnh lên Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path);
            if (result && result.secure_url) {
                imageUrl = result.secure_url;
                fs.unlink(req.file.path, () => { });
            } else {
                return res.status(500).json({ message: "Failed to upload image" });
            }
        } catch (error) {
            console.error("Cloudinary Upload Error:", error);
            fs.unlink(file.path, () => { });
            return res.status(500).json({ message: "Image upload error" });
        }

        // Tạo ảnh mới
        const newWallpaper = await db.wallpaper.create({
            imageUrl,
            description,
            tags: tags ? tags.split(",") : [],
            createdBy: userId,
            fromAlbum: albumId,
        });

        await db.album.findByIdAndUpdate(albumId, { $push: { wallpapers: newWallpaper._id } });

        res.status(201).json(newWallpaper);
    } catch (error) {
        res.status(500).json({ message: "Can't upload image! Try again." });
    }
});

// ✅ Chỉnh sửa ảnh (Chỉ cho phép chủ sở hữu)
WallpaperRouter.put("/:wallpaperId/edit-wallpaper", checkUserJWT, upload.single("imageUrl"), async (req, res) => {
    try {
        const { description, tags } = req.body;
        const userId = req.user.userId; // Lấy userId từ token
        const wallpaper = await db.wallpaper.findById(req.params.wallpaperId);

        if (!wallpaper) {
            return res.status(404).json({ message: "Wallpaper not found" });
        }

        if (wallpaper.createdBy.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized: You can only edit your own wallpapers" });
        }

        let newWallpaperImage = wallpaper.imageUrl;

        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path);
                if (result && result.secure_url) {
                    newWallpaperImage = result.secure_url;
                    fs.unlink(req.file.path, () => { });
                }
            } catch (error) {
                console.error("Cloudinary Upload Error:", error);
                fs.unlink(req.file.path, () => { });
                return res.status(500).json({ message: "Fail to update image. Try again!" });
            }
        }

        const updatedWallpaper = await db.wallpaper.findByIdAndUpdate(
            req.params.wallpaperId,
            { $set: { description, imageUrl: newWallpaperImage, tags: tags ? tags.split(",") : [] } },
            { new: true }
        );

        res.status(200).json(updatedWallpaper);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Xóa ảnh (Chỉ cho phép chủ sở hữu)
WallpaperRouter.delete("/:wallpaperId/delete", checkUserJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        const wallpaper = await db.wallpaper.findById(req.params.wallpaperId);

        if (!wallpaper) {
            return res.status(404).json({ message: "Wallpaper not found" });
        }

        if (wallpaper.createdBy.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized: You can only delete your own wallpapers" });
        }

        await db.album.findByIdAndUpdate(wallpaper.fromAlbum, { $pull: { wallpapers: wallpaper._id } });
        await db.wallpaper.findByIdAndDelete(wallpaper._id);

        res.status(200).json({ message: "Wallpaper deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ✅ Like/Unlike ảnh
WallpaperRouter.post("/:wallpaperId/like", checkUserJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        const wallpaper = await db.wallpaper.findById(req.params.wallpaperId);
        const user = await db.user.findById(userId);

        if (!user || !wallpaper) {
            return res.status(404).json({ message: "User or Wallpaper not found" });
        }

        const isFavorited = user.favorited.includes(wallpaper._id);

        if (isFavorited) {
            user.favorited = user.favorited.filter(id => id.toString() !== wallpaper._id.toString());
            wallpaper.likes -= 1;
        } else {
            user.favorited.push(wallpaper._id);
            wallpaper.likes += 1;
        }

        await user.save();
        await wallpaper.save();

        res.json({ likes: wallpaper.likes, favorited: user.favorited });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ Bình luận ảnh
WallpaperRouter.post("/:wallpaperId/comment", checkUserJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        const newComment = {
            user: userId,
            body: req.body.body,
            date: Date.now(),
        };

        const updatedWallpaper = await db.wallpaper.findByIdAndUpdate(
            req.params.wallpaperId,
            { $push: { comments: newComment } },
            { new: true }
        ).populate("comments.user");

        res.status(200).json(updatedWallpaper);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ✅ Xóa bình luận (Chỉ cho phép chủ sở hữu)
WallpaperRouter.delete("/:wallpaperId/comment/:commentId/delete", checkUserJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        const wallpaper = await db.wallpaper.findById(req.params.wallpaperId);

        if (!wallpaper) {
            return res.status(404).json({ message: "Wallpaper not found" });
        }

        wallpaper.comments = wallpaper.comments.filter(comment =>
            comment._id.toString() !== req.params.commentId || comment.user.toString() !== userId
        );

        await wallpaper.save();
        res.status(200).json(wallpaper);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = WallpaperRouter;
