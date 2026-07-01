import mongoose, { Schema } from "mongoose";

const paymentDetailSchema = new Schema({
  amountPaid: {
    type: Number,
    required: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  paymentMode: {
    type: String,
    enum: ["CASH", "ONLINE", "BANK_TRANSFER"],
    required: true,
  },
  transactionId: {
    type: String,
    trim: true,
  },
  collectedBy: {
    type: Schema.Types.ObjectId,
    ref: "User", // References User with role ACCOUNTANT
    required: true,
  },
});

const feeSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User", // References User with role STUDENT
      required: true,
      index: true,
    },
    academicSessionId: {
      type: Schema.Types.ObjectId,
      ref: "AcademicSession",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true, // e.g. "Term 1 Admission Fees"
    },
    amount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["PAID", "UNPAID", "PARTIALLY_PAID"],
      default: "UNPAID",
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    paymentDetails: [paymentDetailSchema],
  },
  { timestamps: true }
);

export const Fee = mongoose.model("Fee", feeSchema);
