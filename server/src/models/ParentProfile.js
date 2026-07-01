import mongoose, { Schema } from "mongoose";

const parentProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    occupation: { type: String, trim: true, default: null },
    companyName: { type: String, trim: true, default: null },
    annualIncome: { type: Number, default: null },
    relationshipWithStudent: { type: String, trim: true, default: null },
    secondaryContact: { type: String, trim: true, default: null },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    children: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const ParentProfile = mongoose.model("ParentProfile", parentProfileSchema);

