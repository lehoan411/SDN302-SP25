const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const UserRouter = express.Router();
const { checkUserJWT, isAdmin } = require("../middlewares/JsonWebToken");
const User = require("../models/user");
const cloudinary = require("../configs/cloudinary");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

UserRouter.use(bodyParser.json());

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

// ✅ API: Lấy danh sách tất cả user, trừ admin (Admin)
UserRouter.get("/", checkUserJWT, isAdmin, async (req, res) => {
    try {
        const users = await User.find({ roles: { $ne: "admin" } })
            .populate("albums")
            .populate("favorited");

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(400).json({ message: error.message });
    }
});

// ✅ API: Lấy thông tin user từ token
UserRouter.get("/get-by-id", checkUserJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId).populate("albums").populate("favorited");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ✅ API: Cập nhật hồ sơ user
UserRouter.put("/edit-profile", checkUserJWT, upload.single("avatar"), async (req, res) => {
    try {
        const { name, bio, dob } = req.body;
        const userId = req.user.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let newAvatarUrl = user.avatar;

        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path);
                if (result && result.secure_url) {
                    newAvatarUrl = result.secure_url;
                    fs.unlink(req.file.path, () => {});
                } else {
                    return res.status(500).json({ message: "Failed to upload image" });
                }
            } catch (error) {
                fs.unlink(req.file.path, () => {});
                return res.status(500).json({ message: "Fail to update profile. Try again!" });
            }
        }

        const updatedProfile = await User.findByIdAndUpdate(userId, {
            $set: { name, bio, dob, avatar: newAvatarUrl }
        }, { new: true });

        res.status(200).json(updatedProfile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ API: Xóa tài khoản user
UserRouter.delete("/delete-account", checkUserJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
//changePassword:
// ✅ API: Thay đổi mật khẩu user
UserRouter.put("/change-password", checkUserJWT, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.userId;

        // Sử dụng findById để lấy object, không phải mảng
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Kiểm tra mật khẩu cũ
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

        // Hash mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Cập nhật mật khẩu
        await User.findByIdAndUpdate(userId, { password: hashedPassword });

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = UserRouter;