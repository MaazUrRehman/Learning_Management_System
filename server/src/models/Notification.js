import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    recipients: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
    ],
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["GENERAL", "ATTENDANCE", "FEE", "EXAM", "ASSIGNMENT"],
      default: "GENERAL",
    },
    isReadBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // list of users who have read the notification
      },
    ],
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
