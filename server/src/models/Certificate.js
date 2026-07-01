import mongoose, { Schema } from "mongoose";

const certificateSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User", // References User with role STUDENT
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true, // e.g., "Grade 10 Graduation Certificate"
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    certificateUrl: {
      type: String, // Cloudinary file link
      required: true,
    },
    issuedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // References User with role ADMIN or SUPER_ADMIN
      required: true,
    },
  },
  { timestamps: true }
);

export const Certificate = mongoose.model("Certificate", certificateSchema);
