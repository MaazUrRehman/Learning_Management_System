import mongoose, { Schema } from "mongoose";

const academicSessionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // e.g., "2026-2027"
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const AcademicSession = mongoose.model("AcademicSession", academicSessionSchema);
