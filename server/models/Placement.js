
import mongoose from "mongoose";

const placementSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    package: {
      type: String,
      default: "",
      trim: true,
    },
    driveDate: {
      type: String,
      default: "",
    },
    eligibility: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      default: "Open",
      trim: true,
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

const Placement = mongoose.model("Placement", placementSchema);

export default Placement;
