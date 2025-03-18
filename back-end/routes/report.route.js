const express = require("express");
const bodyParser = require("body-parser");
const { checkUserJWT, isAdmin } = require("../middlewares/JsonWebToken");
const ReportRouter = express.Router();
const db = require("../models");

ReportRouter.use(bodyParser.json());

// ✅ Lấy tất cả báo cáo (Admin)

ReportRouter.get("/", checkUserJWT, isAdmin, async (req, res) => {
    try {
        const reports = await db.report.find()
            .populate({
                path: "wallpaper",
                populate: {
                    path: "createdBy",
                    select: "name email", // Ensure createdBy name is fetched
                },
            })
            .populate("reporter", "name email"); // Ensure reporter name is fetched

        const formattedReports = reports.map(report => ({
            ...report.toObject(),
            wallpaper: {
                ...report.wallpaper.toObject(),
                createdBy: {
                    _id: report.wallpaper.createdBy._id,
                    name: report.wallpaper.createdBy.name,
                    mail: report.wallpaper.createdBy.email,
                },
            },
            reporter: {
                _id: report.reporter._id,
                name: report.reporter.name,
                mail: report.reporter.email,
            },
        }));

        res.status(200).json(formattedReports);
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(400).json({ message: error.message });
    }
});

module.exports = ReportRouter;

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

ReportRouter.post("/delete/:id", async (req, res) => {
    try {
        const { id: wallpaperId } = req.params;
        const { ownerId } = req.body;

        if (!wallpaperId) {
            return res.status(400).json({ message: "Wallpaper ID is required" });
        }

        // Find wallpaper
        const wallpaper = await db.wallpaper.findById(wallpaperId);
        if (!wallpaper) {
            return res.status(404).json({ message: "Wallpaper not found" });
        }

        // Delete reports associated with the wallpaper
        await db.report.deleteMany({ wallpaper: wallpaperId });

        // Delete the wallpaper itself
        await db.wallpaper.deleteOne({ _id: wallpaperId });

        return res.status(200).json({ message: "Wallpaper and associated reports deleted successfully" });
    } catch (error) {
        console.error("Error deleting wallpaper:", error);
        return res.status(500).json({ message: "Error deleting wallpaper", error: error.message });
    }
});

ReportRouter.delete("/:id", async (req, res) => {
    try {
        const { id: wallpaperId } = req.params;

        if (!wallpaperId) {
            return res.status(400).json({ message: "Wallpaper ID is required" });
        }

        // Delete all reports associated with the wallpaper
        const result = await db.report.deleteMany({ wallpaper: wallpaperId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No reports found for the specified wallpaper." });
        }

        return res.status(200).json({ message: "Reports deleted successfully." });
    } catch (error) {
        console.error("Error deleting reports:", error);
        return res.status(500).json({ message: "Error deleting reports", error: error.message });
    }
});

module.exports = ReportRouter;