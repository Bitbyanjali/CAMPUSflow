
import express from "express";
import Task from "../models/Task.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all tasks for the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ tasks });
  } catch (error) {
    console.error("Fetch tasks error:", error.message);
    return res.status(500).json({ message: "Failed to fetch tasks." });
  }
});

// Create a task
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, subject, dueDate, completed } = req.body;

if (typeof title !== "string" || !title.trim()) {
  return res.status(400).json({
    message: "Task title is required.",
  });
}

if (title.trim().length > 150) {
  return res.status(400).json({
    message: "Task title cannot exceed 150 characters.",
  });
}

if (
  subject !== undefined &&
  typeof subject !== "string"
) {
  return res.status(400).json({
    message: "Subject must be a string.",
  });
}

if (
  dueDate !== undefined &&
  typeof dueDate !== "string"
) {
  return res.status(400).json({
    message: "Due date must be a string.",
  });
}

if (
  completed !== undefined &&
  typeof completed !== "boolean"
) {
  return res.status(400).json({
    message: "Completed must be true or false.",
  });
}


    const task = await Task.create({
      title: title.trim(),
      subject,
      dueDate,
      completed,
      userId: req.userId,
    });

    return res.status(201).json({
      message: "Task created successfully.",
      task,
    });
  } catch (error) {
    console.error("Create task error:", error.message);
    return res.status(500).json({ message: "Failed to create task." });
  }
});

// Update a task belonging to the logged-in user
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const allowedFields = ["title", "subject", "dueDate", "completed"];
    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    // Validate title
if (
  Object.prototype.hasOwnProperty.call(updates, "title") &&
  (typeof updates.title !== "string" ||
    !updates.title.trim())
) {
  return res.status(400).json({
    message: "Task title cannot be empty.",
  });
}

if (
  typeof updates.title === "string" &&
  updates.title.trim().length > 150
) {
  return res.status(400).json({
    message: "Task title cannot exceed 150 characters.",
  });
}

// Validate subject
if (
  Object.prototype.hasOwnProperty.call(updates, "subject") &&
  typeof updates.subject !== "string"
) {
  return res.status(400).json({
    message: "Subject must be a string.",
  });
}

    // Validate due date
    if (
      Object.prototype.hasOwnProperty.call(updates, "dueDate") &&
      typeof updates.dueDate !== "string"
    ) {
      return res.status(400).json({
        message: "Due date must be a string.",
      });
    }

    // Validate completion status
    if (
      Object.prototype.hasOwnProperty.call(updates, "completed") &&
      typeof updates.completed !== "boolean"
    ) {
      return res.status(400).json({
        message: "Completed must be true or false.",
      });
    }

    if (typeof updates.title === "string") {
      updates.title = updates.title.trim();
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    return res.status(200).json({
      message: "Task updated successfully.",
      task,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid task ID." });
    }

    console.error("Update task error:", error.message);
    return res.status(500).json({ message: "Failed to update task." });
  }
});

// Delete a task belonging to the logged-in user
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    return res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid task ID." });
    }

    console.error("Delete task error:", error.message);
    return res.status(500).json({ message: "Failed to delete task." });
  }
});

export default router;
