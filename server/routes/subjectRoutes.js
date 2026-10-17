
import express from "express";
import mongoose from "mongoose";
import Subject from "../models/Subject.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// GET: Fetch logged-in user's subjects
router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({ subjects });
  } catch (error) {
    console.error("Fetch subjects error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch subjects.",
    });
  }
});

// POST: Create a subject
router.post("/", async (req, res) => {
  try {
    const { name, code, attendance } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Subject name is required.",
      });
    }
    if (name.trim().length > 100) {
        return res.status(400).json({
            message: "Subject name cannot exceed 100 characters.",
        });
        }

        if (code !== undefined && typeof code !== "string") {
        return res.status(400).json({
            message: "Subject code must be a string.",
        });
        }

        if (
        attendance !== undefined &&
        (typeof attendance !== "number" ||
            !Number.isFinite(attendance) ||
            attendance < 0 ||
            attendance > 100)
        ) {
        return res.status(400).json({
            message: "Attendance must be a number between 0 and 100.",
        });
        }

    const subject = await Subject.create({
      name: name.trim(),
      code,
      attendance,
      userId: req.userId,
    });

    return res.status(201).json({
      message: "Subject created successfully.",
      subject,
    });
  } catch (error) {
    console.error("Create subject error:", error.message);
    return res.status(500).json({
      message: "Failed to create subject.",
    });
  }
});

// PATCH: Update a subject

router.patch("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid subject ID.",
      });
    }

    const allowedFields = ["name", "code", "attendance"];
    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "At least one valid field is required to update a subject.",
      });
    }

    if (
      Object.prototype.hasOwnProperty.call(updates, "name") &&
      (typeof updates.name !== "string" || !updates.name.trim())
    ) {
      return res.status(400).json({
        message: "Subject name cannot be empty.",
      });
    }

    if (typeof updates.name === "string") {
      updates.name = updates.name.trim();

      if (updates.name.length > 100) {
        return res.status(400).json({
          message: "Subject name cannot exceed 100 characters.",
        });
      }
    }

    if (
      Object.prototype.hasOwnProperty.call(updates, "code") &&
      typeof updates.code !== "string"
    ) {
      return res.status(400).json({
        message: "Subject code must be a string.",
      });
    }

    if (
      Object.prototype.hasOwnProperty.call(updates, "attendance") &&
      (
        typeof updates.attendance !== "number" ||
        !Number.isFinite(updates.attendance) ||
        updates.attendance < 0 ||
        updates.attendance > 100
      )
    ) {
      return res.status(400).json({
        message: "Attendance must be a number between 0 and 100.",
      });
    }

    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found.",
      });
    }

    return res.status(200).json({
      message: "Subject updated successfully.",
      subject,
    });
  } catch (error) {
    console.error("Update subject error:", error.message);
    return res.status(500).json({
      message: "Failed to update subject.",
    });
  }
});


// DELETE: Delete a subject
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid subject ID." });
    }

    const subject = await Subject.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    return res.status(200).json({
      message: "Subject deleted successfully.",
    });
  } catch (error) {
    console.error("Delete subject error:", error.message);
    return res.status(500).json({
      message: "Failed to delete subject.",
    });
  }
});

export default router;
