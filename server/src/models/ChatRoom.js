import mongoose, { Schema } from "mongoose";

const chatRoomSchema = new Schema(
  {
    name: {
      type: String,
      trim: true, // e.g. "Physics 101 Group" (only for GROUP/BROADCAST types)
    },
    type: {
      type: String,
      enum: ["DIRECT", "GROUP", "BROADCAST"],
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class", // Optional linking to specific class scopes
      index: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],
  },
  { timestamps: true }
);

export const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
