
import express from "express";
import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import Subject from "../models/Subject.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// GET: Fetch attendance records for the logged-in user
router.get("/", async (req, res) => {
  try {
    const records = await Attendance.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({ attendance: records });
  } catch (error) {
    console.error("Fetch attendance error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch attendance.",
    });
  }
});

// PUT: Create or update attendance for a subject
router.put("/:subjectId", async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { totalClasses, attendedClasses } = req.body;

    if (!mongoose.isValidObjectId(subjectId)) {
      return res.status(400).json({ message: "Invalid subject ID." });
    }

    
    if (
    !Object.prototype.hasOwnProperty.call(req.body, "totalClasses") ||
    !Object.prototype.hasOwnProperty.call(req.body, "attendedClasses") ||
    !Number.isInteger(totalClasses) ||
    !Number.isInteger(attendedClasses) ||
    totalClasses < 0 ||
    attendedClasses < 0 ||
    attendedClasses > totalClasses
    ) {
    return res.status(400).json({
        message:
        "Provide valid non-negative integer attendance counts, with attended classes not exceeding total classes.",
    });
    }

    const subject = await Subject.findOne({
      _id: subjectId,
      userId: req.userId,
    });

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found for this user.",
      });
    }

    const record = await Attendance.findOneAndUpdate(
      { userId: req.userId, subjectId },
      {
        $set: {
          totalClasses,
          attendedClasses,
          subjectName: subject.name,
        },
        $setOnInsert: {
          userId: req.userId,
          subjectId,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      message: "Attendance saved successfully.",
      attendance: record,
    });
  } catch (error) {
    console.error("Save attendance error:", error.message);
    return res.status(500).json({
      message: "Failed to save attendance.",
    });
  }
});

export default router;
