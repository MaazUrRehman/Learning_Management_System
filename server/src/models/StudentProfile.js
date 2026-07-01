import mongoose, { Schema } from "mongoose";

const studentProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    studentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    admissionNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    rollNumber: { type: String, trim: true, default: null },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      default: null,
      index: true,
    },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: "Section",
      default: null,
      index: true,
    },
    academicSessionId: {
      type: Schema.Types.ObjectId,
      ref: "AcademicSession",
      default: null,
    },
    admissionDate: { type: Date, default: null },
    dateOfBirth: { type: Date, default: null },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER", null],
      default: null,
    },
    religion: { type: String, trim: true, default: null },
    nationality: { type: String, trim: true, default: null },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

export const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);

