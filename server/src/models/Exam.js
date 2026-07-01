import mongoose, { Schema } from "mongoose";

const examSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // e.g. "Term 1 Final Exam"
    },
    academicSessionId: {
      type: Schema.Types.ObjectId,
      ref: "AcademicSession",
      required: true,
      index: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    maxMarks: {
      type: Number,
      required: true,
    },
    examDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export const Exam = mongoose.model("Exam", examSchema);
