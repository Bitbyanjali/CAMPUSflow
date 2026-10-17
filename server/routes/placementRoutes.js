import express from "express";
import mongoose from "mongoose";
import Placement from "../models/Placement.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// GET: Fetch placements for the logged-in user
router.get("/", async (req, res) => {
  try {
    const placements = await Placement.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({ placements });
  } catch (error) {
    console.error("Fetch placements error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch placements.",
    });
  }
});

// POST: Add a placement
router.post("/", async (req, res) => {
  try {
    const {
      company,
      role,
      package: salaryPackage,
      driveDate,
      eligibility,
      status,
    } = req.body;

    if (
      typeof company !== "string" ||
      !company.trim() ||
      typeof role !== "string" ||
      !role.trim()
    ) {
      return res.status(400).json({
        message: "Company and role are required.",
      });
    }

    if (company.trim().length > 100 || role.trim().length > 100) {
    return res.status(400).json({
        message: "Company and role cannot exceed 100 characters.",
    });
    }

    const allowedStatuses = [
    "Open",
    "Applied",
    "Interview",
    "Selected",
    "Rejected",
    ];

    if (
    status !== undefined &&
    (typeof status !== "string" || !allowedStatuses.includes(status.trim()))
    ) {
    return res.status(400).json({
        message: "Invalid placement status.",
    });
    }

    const placement = await Placement.create({
      company: company.trim(),
      role: role.trim(),
      package: typeof salaryPackage === "string" ? salaryPackage.trim() : "",
      driveDate: typeof driveDate === "string" ? driveDate : "",
      eligibility: typeof eligibility === "string" ? eligibility.trim() : "",
      status: typeof status === "string" && status.trim() ? status.trim() : "Open",
      userId: req.userId,
    });

    return res.status(201).json({
      message: "Placement added successfully.",
      placement,
    });
  } catch (error) {
    console.error("Add placement error:", error.message);
    return res.status(500).json({
      message: "Failed to add placement.",
    });
  }
});

// PATCH: Update a placement
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid placement ID." });
    }

    const allowedFields = [
      "company",
      "role",
      "package",
      "driveDate",
      "eligibility",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== "string") {
          return res.status(400).json({
            message: `${field} must be a string.`,
          });
        }

        updates[field] = req.body[field].trim();
      }
    }

    if (updates.company !== undefined && !updates.company) {
      return res.status(400).json({ message: "Company cannot be empty." });
    }

    if (updates.role !== undefined && !updates.role) {
      return res.status(400).json({ message: "Role cannot be empty." });
    }

    if (Object.keys(updates).length === 0) {
    return res.status(400).json({
        message: "At least one valid field is required to update a placement.",
    });
    }

    const allowedStatuses = [
    "Open",
    "Applied",
    "Interview",
    "Selected",
    "Rejected",
    ];

    if (
    updates.status !== undefined &&
    !allowedStatuses.includes(updates.status)
    ) {
    return res.status(400).json({
        message: "Invalid placement status.",
    });
    }

    if (
    (updates.company !== undefined && updates.company.length > 100) ||
    (updates.role !== undefined && updates.role.length > 100)
    ) {
    return res.status(400).json({
        message: "Company and role cannot exceed 100 characters.",
    });
    }

    const placement = await Placement.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!placement) {
      return res.status(404).json({ message: "Placement not found." });
    }

    return res.status(200).json({
      message: "Placement updated successfully.",
      placement,
    });
  } catch (error) {
    console.error("Update placement error:", error.message);
    return res.status(500).json({
      message: "Failed to update placement.",
    });
  }
});

// DELETE: Delete a placement
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid placement ID." });
    }

    const placement = await Placement.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!placement) {
      return res.status(404).json({ message: "Placement not found." });
    }

    return res.status(200).json({
      message: "Placement deleted successfully.",
    });
  } catch (error) {
    console.error("Delete placement error:", error.message);
    return res.status(500).json({
      message: "Failed to delete placement.",
    });
  }
});

export default router;
