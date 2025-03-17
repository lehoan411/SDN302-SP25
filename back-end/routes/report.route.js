const express = require("express");
const bodyParser = require("body-parser");
const { checkUserJWT } = require("../middlewares/JsonWebToken");
const ReportRouter = express.Router();
const db = require("../models");

ReportRouter.use(bodyParser.json());

// ✅ Lấy tất cả báo cáo (Admin)
ReportRouter.get("/", checkUserJWT, async (req, res) => {
    try {
        const reports = await db.report.find().populate("reportedBy").populate("wallpaper");
        res.status(200).json(reports);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ✅ Lấy báo cáo theo ID
ReportRouter.get("/:reportId", checkUserJWT, async (req, res) => {
    const { reportId } = req.params;
    try {
        const report = await db.report.findById(reportId).populate("reportedBy").populate("wallpaper");
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }
        res.status(200).json(report);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ✅ Tạo báo cáo mới (Lấy userId từ token)
ReportRouter.post("/create", checkUserJWT, async (req, res) => {
    try {
        const { reason, wallpaper } = req.body;
        const userId = req.user?.userId; // Kiểm tra userId từ token

        console.log("User ID from token:", userId); // Debugging

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: No user ID found in token" });
        }

        if (!reason) {
            return res.status(400).json({ message: "Report content is required" });
        }
        if (!wallpaper) {
            return res.status(400).json({ message: "Wallpaper ID is required" });
        }

        const newReport = await db.report.create({
            reason,
            wallpaper: wallpaper,
            reporter: userId, // Sử dụng userId từ token
        });

        res.status(201).json({ message: "Report created successfully", report: newReport });
    } catch (error) {
        console.error("Error creating report:", error);
        res.status(400).json({ message: error.message });
    }
});

module.exports = ReportRouter;