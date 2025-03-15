const express = require('express');
const bodyParser = require("body-parser");
const AlbumRouter = express.Router();
const db = require('../models');
AlbumRouter.use(bodyParser.json());
const mongoose = require('mongoose')
const cloudinary = require("../configs/cloudinary");
const fs = require('fs');
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

AlbumRouter.get('/', async (req, res, next) => {
    try {
        const album = await db.album.find().populate('wallpapers').populate('author');
        res.status(200).json(album);
    } catch (error) {
        res.status(400).json({ message: error });
    }
})

AlbumRouter.get('/:albumId', async (req, res) => {
    const { albumId } = req.params;
    try {
        const album = await db.album.findById(albumId).populate('wallpapers').populate('author');
        res.status(200).json(album);
    } catch (error) {
        res.status(400).json({ message: error });
    }
})



AlbumRouter.post("/create", upload.single("albumImage"), async (req, res) => {
    const { albumName, userId } = req.body; // Lấy userId từ request body
    let albumImage = "";    

    if (!albumName) {
        return res.status(400).json({ message: "Album name is required" });
    }
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    if (req.file) {
        try {
            const result = await cloudinary.uploader.upload(req.file.path, {
                timeout: 60000, // Tăng timeout lên 60 giây
            });
        
            if (result && result.secure_url) {
                albumImage = result.secure_url;
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error("Error deleting local file:", err);
                });
            } else {
                return res.status(500).json({ message: "Failed to upload image" });
            }
        } catch (error) {
            console.error("Cloudinary Upload Error:", error);
            fs.unlink(req.file.path, () => {});
            return res.status(500).json({ message: "Image upload timeout. Try again with a smaller file." });
        }
    }

    try {
        const newAlbum = await db.album.create({
            albumName,
            albumImage,
            author: new mongoose.Types.ObjectId(userId), // Chắc chắn userId được lưu dưới dạng ObjectId
        });

        const createdAlbum = await db.user.findByIdAndUpdate(
            userId,
            { $push: { albums: newAlbum._id } },
            { new: true }
        );

        res.status(201).json({
            message: "Album created successfully",
            album: createdAlbum,
        });
    } catch (error) {
        console.error("Error creating album:", error);
        res.status(500).json({ message: "Failed to create album" });
    }
});

AlbumRouter.put('/:albumId/edit-album', upload.single("albumImage"), async (req, res) => {
     try {
            console.log("Req file:", req.file);
            const { albumName } = req.body;
            const { albumId } = req.params;
            const album = await db.album.findById(albumId);

            if (!album) {
                return res.status(400).json({ message: "Album not found" });
            }
        
            let newAlbumImage = album.albumImage; // Giữ nguyên ảnh cũ nếu không upload ảnh mới
    
            // Kiểm tra nếu có ảnh được tải lên
            if (req.file) {
                try {
                    const result = await cloudinary.uploader.upload(req.file.path, {
                        timeout: 60000, // Tăng timeout lên 60 giây
                    });
                
                    if (result && result.secure_url) {
                        newAlbumImage = result.secure_url;
                        fs.unlink(req.file.path, (err) => {
                            if (err) console.error("Error deleting local file:", err);
                        });
                    } else {
                        return res.status(500).json({ message: "Failed to upload image" });
                    }
                } catch (error) {
                    console.error("Cloudinary Upload Error:", error);
                    fs.unlink(req.file.path, () => {});
                    return res.status(500).json({ message: "Image upload timeout. Try again with a smaller file." });
                }
            }
            
            // Cập nhật thông tin album
            const newAlbumInfo = {
                albumName: albumName,
                albumImage: newAlbumImage
            };
            // Lưu album vào database
            const updatedAlbum = await db.album.findByIdAndUpdate(
                albumId,
                {
                    $set: {
                        albumName: newAlbumInfo.albumName,
                        albumImage: newAlbumInfo.albumImage
                    }
                },
                { new: true }
            );
            
            if (!updatedAlbum) {
                return res.status(404).json({ message: "Album not found" });
            }
            
            res.status(200).json({ 
                message: "Album updated successfully",
                album: updatedAlbum // Trả về album đã cập nhật đầy đủ
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            return res.status(500).json({ message: error.message });
        }
});

AlbumRouter.delete('/:albumId/delete', async (req, res) => {
    const { albumId } = req.params;
    try {
        const album = await db.album.findByIdAndDelete(albumId);
        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }
        await db.wallpaper.deleteMany({ fromAlbum: albumId });
        await db.user.findByIdAndUpdate(album.author, { $pull: { albums: albumId } });
        
        res.status(200).json({ message: "Album deleted successfully" });

    } catch (error) {
        res.status(400).json({ message: error });
    }
})

module.exports = AlbumRouter;