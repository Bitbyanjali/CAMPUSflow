
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
        type: String,
        required: [true, "Task title is required."],
        trim: true,
        maxlength: [150, "Task title cannot exceed 150 characters."],
        validate: {
          validator: (value) => value.trim().length > 0,
          message: "Task title cannot be empty.",
        },
      },
    subject: {
      type: String,
      default: "",
      trim: true,
    },
    dueDate: {
      type: String,
      default: "",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
