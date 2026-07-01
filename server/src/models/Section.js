import mongoose, { Schema } from "mongoose";

const sectionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    classTeacherId: {
      type: Schema.Types.ObjectId,
      ref: "User", // References User with role FACULTY
      index: true,
    },
  },
  { timestamps: true }
);

// Create compound index for unique section name per class
sectionSchema.index({ name: 1, classId: 1 }, { unique: true });

export const Section = mongoose.model("Section", sectionSchema);
