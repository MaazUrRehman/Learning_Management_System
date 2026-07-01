import mongoose, { Schema } from "mongoose";

const resultSchema = new Schema(
  {
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User", // References User with role STUDENT
      required: true,
      index: true,
    },
    marksObtained: {
      type: Number,
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // References User with role FACULTY
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate grade/result entry for a student's specific exam
resultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

export const Result = mongoose.model("Result", resultSchema);
