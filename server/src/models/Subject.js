import mongoose, { Schema } from "mongoose";

const subjectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Unique subject code within the same class
subjectSchema.index({ code: 1, classId: 1 }, { unique: true });

export const Subject = mongoose.model("Subject", subjectSchema);
