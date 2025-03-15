const express = require('express');
const bodyParser = require("body-parser");
const db = require('../models');
const cloudinary = require('../configs/cloudinary');
const fs = require('fs');
const WallpaperRouter = express.Router();
WallpaperRouter.use(bodyParser.json());
const multer = require("multer");
const path = require("path");

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads');
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + path.extname(file.originalname));
        }
    }),
});


// Lấy tất cả ảnh
WallpaperRouter.get('/', async (req, res) => {
    try {
        const wallpapers = await db.wallpaper
            .find()
            .populate('createdBy')
            .populate('fromAlbum')
            .populate('comments.user')

        res.status(200).json(wallpapers);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Lấy ảnh theo ID
WallpaperRouter.get('/:wallpaperId', async (req, res) => {
    const { wallpaperId } = req.params;
    try {
        const wallpaper = await db.wallpaper
            .findById(wallpaperId)
            .populate('createdBy')
            .populate('fromAlbum')
            .populate('comments.user')

        if (!wallpaper) {
            return res.status(404).json({ message: "Wallpaper not found" });
        }

        res.status(200).json(wallpaper);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Tạo ảnh mới và upload lên Cloudinary
WallpaperRouter.post('/create', upload.single("imageUrl"), async (req, res) => {
    try {
        console.log("Req file:", req.file);
        const { albumId, userId, description, tags } = req.body;
        let imageUrl = "";

        // Kiểm tra thông tin đầu vào
        if (!albumId || !userId) {
            return res.status(400).json({ message: "Missing albumId or userId" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No image file uploaded" });
        }

        // Tải ảnh lên Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);
        if (result && result.secure_url) {
            imageUrl = result.secure_url;
            fs.unlink(req.file.path, (err) => { if (err) console.error("Error deleting local file:", err); });
        } else {
            return res.status(500).json({ message: "Failed to upload image" });
        }

        // Tạo ảnh mới
        const newWallpaper = new db.wallpaper({
            imageUrl,
            description,
            tags: tags ? tags.split(",") : [],
            createdBy: userId,
            fromAlbum: albumId,
        });
        await newWallpaper.save();
        await db.album.findByIdAndUpdate(albumId, { $push: { wallpapers: newWallpaper._id } });
        res.status(201).json(newWallpaper);
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        fs.unlink(req.file.path, () => { });
        return res.status(500).json({ message: "Cant't update profile! Try again." });
    }
});

// Chỉnh sửa thông tin ảnh
WallpaperRouter.put('/:wallpaperId/edit-wallpaper', upload.single("imageUrl"), async (req, res) => {
    try {
        console.log("Req file:", req.file);
        const { description, tags } = req.body;
        const { wallpaperId } = req.params;
        const wallpaper = await db.wallpaper.findById(wallpaperId);

        if (!wallpaper) {
            return res.status(400).json({ message: "Wallpaper not found" });
        }

        let newWallpaperImage = wallpaper.imageUrl; // Giữ nguyên ảnh cũ nếu không upload ảnh mới

        // Kiểm tra nếu có ảnh được tải lên
        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    timeout: 60000, // Tăng timeout lên 60 giây
                });

                if (result && result.secure_url) {
                    newWallpaperImage = result.secure_url;
                    fs.unlink(req.file.path, (err) => {
                        if (err) console.error("Error deleting local file:", err);
                    });
                } else {
                    return res.status(500).json({ message: "Failed to upload image" });
                }
            } catch (error) {
                console.error("Cloudinary Upload Error:", error);
                fs.unlink(req.file.path, () => { });
                return res.status(500).json({ message: "Image upload timeout. Try again with a smaller file." });
            }
        }

        // Cập nhật thông tin wallpaper
        const newWallpaperInfo = {
            description: description,
            imageUrl: newWallpaperImage,
            tags: tags ? tags.split(",") : []
        };
        // Lưu wallpaper vào database
        const updatedWallpaper = await db.wallpaper.findByIdAndUpdate(
            wallpaperId,
            {
                $set: {
                    description: newWallpaperInfo.description,
                    imageUrl: newWallpaperInfo.imageUrl,
                    tags: newWallpaperInfo.tags
                }
            },
            { new: true }
        );

        if (!updatedWallpaper) {
            return res.status(404).json({ message: "Wallpaper not found" });
        }

        res.status(200).json({
            message: "Wallpaper updated successfully",
            wallpaper: updatedWallpaper
        });
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        fs.unlink(req.file.path, () => { });
        return res.status(500).json({ message: "Image upload timeout. Try again with a smaller file." });
    }
});

WallpaperRouter.delete('/:wallpaperId/delete', async (req, res) => {
    const { wallpaperId } = req.params;
    try {
        const wallpaper = await db.wallpaper.findById(wallpaperId);
        if (!wallpaper) {
            return res.status(404).json({ message: "Wallpaper not found" });
        }
        await db.album.findByIdAndUpdate(wallpaper.fromAlbum, { $pull: { wallpapers: wallpaperId } });
        await db.wallpaper.findByIdAndDelete(wallpaperId);
        res.status(200).json({ message: "Wallpaper deleted successfully" });

    } catch (error) {
        res.status(400).json({ message: error });
    }
})

WallpaperRouter.post("/:wallpaperId/like", async (req, res) => {
    try {
        const { userId } = req.body;
        const {wallpaperId} = req.params;

        const user = await db.user.findById(userId);
        const wallpaper = await db.wallpaper.findById(wallpaperId);

        if (!user || !wallpaper) {
            return res.status(404).json({ message: "User or Wallpaper not found" });
        }

        let isFavorited = user.favorited.includes(wallpaperId);

        if (isFavorited) {
            // Bỏ thích
            user.favorited = user.favorited.filter(id => id.toString() !== wallpaperId);
            wallpaper.likes -= 1;
        } else {
            // Thích
            user.favorited.push(wallpaperId);
            wallpaper.likes += 1;
        }

        await user.save();
        await wallpaper.save();

        res.json({ 
            likes: wallpaper.likes, 
            favorited: user.favorited // Trả về danh sách ảnh đã thích của user
        });
    } catch (error) {
        console.error("Error handling like:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

WallpaperRouter.post('/:wallpaperId/comment', async (req, res) => {
    const { wallpaperId } = req.params;
    const { userId, body } = req.body;
    try {
        const newComment = {
            user: userId,
            body,
            date: Date.now(),
        };
        const updatedWallpaper = await db.wallpaper.findByIdAndUpdate(
            wallpaperId,
            { $push: { comments: newComment } },
            { new: true }
        ).populate('comments.user');
        res.status(200).json(updatedWallpaper);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

WallpaperRouter.put('/:wallpaperId/comment/:commentId/edit', async (req, res) => {
    const { wallpaperId, commentId } = req.params;
    const { body } = req.body;
    try {
        const updatedWallpaper = await db.wallpaper.findOneAndUpdate(
            { _id: wallpaperId, "comments._id": commentId },
            { $set: { "comments.$.body": body } },
            { new: true }
        ).populate('comments.user');
        res.status(200).json(updatedWallpaper);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

WallpaperRouter.delete('/:wallpaperId/comment/:commentId/delete', async (req, res) => {
    const { wallpaperId, commentId } = req.params;
    try {
        const updatedWallpaper = await db.wallpaper.findByIdAndUpdate(
            wallpaperId,
            { $pull: { comments: { _id: commentId } } },
            { new: true }
        ).populate('comments.user');
        res.status(200).json(updatedWallpaper);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = WallpaperRouter;