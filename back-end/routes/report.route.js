const express = require('express');
const bodyParser = require("body-parser");
const ReportRouter = express.Router();
const db = require('../models');
ReportRouter.use(bodyParser.json());
const mongoose = require('mongoose')

// Lấy tất cả báo cáo
ReportRouter.get('/', async (req, res) => {
    try {
        const reports = await db.report.find().populate('reportedBy').populate('wallpaper');
        res.status(200).json(reports);
    } catch (error) {
        res.status(400).json({ message: error });
    }
});

// Lấy báo cáo theo ID
ReportRouter.get('/:reportId', async (req, res) => {
    const { reportId } = req.params;
    try {
        const report = await db.report.findById(reportId).populate('reportedBy').populate('wallpaper');
        res.status(200).json(report);
    } catch (error) {
        res.status(400).json({ message: error });
    }
});

// Tạo báo cáo mới

ReportRouter.post('/create', async (req, res) => {
    const { reason, wallpaper, reporter } = req.body;
    if (!reason) {
        return res.status(400).json({ message: "Report content is required" });
    }
    if (!wallpaper) {
        return res.status(400).json({ message: "Wallpaper ID is required" });
    }
    if (!reporter) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        const report = await db.report.create({
            reason,
            wallpaper: wallpaper,
            reporter: reporter,
        });

        res.status(201).json(report);
    } catch (error) {
        res.status(400).json({ message: error });
    }
});

module.exports = ReportRouter;