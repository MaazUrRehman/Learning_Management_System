import mongoose, { Schema } from "mongoose";

const submissionSchema = new Schema(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User", // References User with role STUDENT
      required: true,
      index: true,
    },
    fileUrl: {
      type: String, // Cloudinary submission document
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    grade: {
      type: String,
      trim: true,
    },
    feedback: {
      type: String,
      trim: true,
    },
    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // References User with role FACULTY
    },
  },
  { timestamps: true }
);

// Prevent student from submitting the same assignment multiple times
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export const Submission = mongoose.model("Submission", submissionSchema);
