import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    chatRoomId: {
      type: Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    messageText: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [
      {
        type: String, // Cloudinary attachment URLs
      },
    ],
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
