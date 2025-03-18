const express = require("express");
const bodyParser = require("body-parser");
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
        const users = await User.find({ roles: { $ne: "admin" } }) // Exclude admins
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
        const userId = req.user.userId; // Lấy userId từ token
        const user = await User.findById(userId).populate("albums").populate("favorited");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ✅ API: Cập nhật hồ sơ user (Lấy userId từ token)
UserRouter.put("/edit-profile", checkUserJWT, upload.single("avatar"), async (req, res) => {
    try {
        console.log("Req file:", req.file);
        const { name, bio, dob } = req.body;
        const userId = req.user.userId; // Lấy userId từ token
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let newAvatarUrl = user.avatar; // Giữ nguyên ảnh cũ nếu không upload ảnh mới

        // Nếu có ảnh mới, upload lên Cloudinary
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
                fs.unlink(req.file.path, () => {});
                return res.status(500).json({ message: "Fail to update profile. Try again!" });
            }
        }

        // Cập nhật thông tin user
        const updatedProfile = await User.findByIdAndUpdate(userId, {
            $set: {
                name: name,
                bio: bio,
                dob: dob,
                avatar: newAvatarUrl
            }
        }, { new: true });

        res.status(200).json(updatedProfile);

    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ message: error.message });
    }
});

// ✅ API: Xóa tài khoản user (User có thể tự xóa)
UserRouter.delete("/delete-account", checkUserJWT, async (req, res) => {
    try {
        const userId = req.user.userId; // Lấy userId từ token

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });

    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Block user (inactive)
UserRouter.patch("/block/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const { status } = req.body;

        console.log("Received Status:", status);

        if (!["active", "inactive"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { status: "inactive" } },
            { new: true }
        ).populate("roles", "-_id");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found or no changes made" });
        }

        res.status(200).json({ message: "User status updated successfully", data: updatedUser });
    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Activate user (set status to "active")
UserRouter.patch("/activate/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const { status } = req.body;

        console.log("Received Status:", status);

        if (!["active", "inactive"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { status: "active" } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found or no changes made" });
        }

        res.status(200).json({ message: "User activated successfully", data: updatedUser });
    } catch (error) {
        console.error("Error activating user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

UserRouter.patch("/upgrade/:id", async (req, res) => {
    try {
        const userId = req.params.id;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { roles: "user Vip" } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found or no changes made" });
        }

        res.status(200).json({ message: "User upgraded to VIP successfully", data: updatedUser });
    } catch (error) {
        console.error("Error upgrading user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Downgrade "user Vip" to "user"
UserRouter.patch("/downgrade/:id", async (req, res) => {
    try {
        const userId = req.params.id;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { roles: "user" } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found or no changes made" });
        }

        res.status(200).json({ message: "User downgraded to normal user successfully", data: updatedUser });
    } catch (error) {
        console.error("Error downgrading user role:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = UserRouter;
