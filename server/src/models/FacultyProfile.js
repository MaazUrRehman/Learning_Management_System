import mongoose, { Schema } from "mongoose";

const facultyProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    designation: { type: String, trim: true, default: null },
    department: { type: String, trim: true, default: null },
    qualification: { type: String, trim: true, default: null },
    specialization: { type: String, trim: true, default: null },
    experience: { type: String, trim: true, default: null },
    joiningDate: { type: Date, default: null },
    salary: { type: Number, default: null },
    emergencyContact: { type: String, trim: true, default: null },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    subjectsTaught: [
      {
        type: Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
  },
  { timestamps: true }
);

export const FacultyProfile = mongoose.model("FacultyProfile", facultyProfileSchema);

