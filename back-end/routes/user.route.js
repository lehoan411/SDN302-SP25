const express = require('express');
const bodyParser = require("body-parser");
const UserRouter = express.Router();
const db = require('../models');
UserRouter.use(bodyParser.json());
const mongoose = require('mongoose')
const  cloudinary  = require('../configs/cloudinary');
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

UserRouter.get('/', async (req, res, next) => {
    try {
        const user = await db.user.find().populate('albums').populate('favorited');
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error });
    }
})

UserRouter.get('/get-by-id', async (req, res) => {
    const id  = req.payload.id;
    try {
        const user = await db.user.findById(id).populate('albums').populate('favorited');
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error });
    }
})

UserRouter.put('/:userId/edit-profile', upload.single('avatar'), async (req, res) => {
    try {
        console.log("Req file:", req.file);
        const { name, bio, dob } = req.body;
        const { userId } = req.params;
        const user = await db.user.findById(userId);

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        let newAvatarUrl = user.avatar; // Giữ nguyên ảnh cũ nếu không upload ảnh mới

        // Kiểm tra nếu có ảnh được tải lên
        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path);
                if (result && result.secure_url) {
                    newAvatarUrl = result.secure_url;
                    // Xóa ảnh cục bộ sau khi upload thành công
                    fs.unlink(req.file.path, (err) => {
                        if (err) console.error("Error deleting local file:", err);
                    });
                } else {
                    return res.status(500).json({ message: "Failed to upload image" });
                }
            } catch (error) {
                console.error("Cloudinary Upload Error:", error);
                fs.unlink(req.file.path, () => { });
                return res.status(500).json({ message: "Image capacity is too large!" });
            }
        }

        // Cập nhật thông tin user
        const newUserInfo = {
            name: name,
            bio: bio,
            dob: dob,
            avatar: newAvatarUrl
        };
        

        // Lưu user vào database
        const updatedProfile = await db.user.findByIdAndUpdate(userId, {
            $set: {
                name: newUserInfo.name,
                bio: newUserInfo.bio,
                dob: newUserInfo.dob,
                avatar: newUserInfo.avatar
            }
        }, { new: true });

        res.status(200).json(updatedProfile);

    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ message: error.message });
    }
});


module.exports = UserRouter;