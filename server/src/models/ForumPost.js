import mongoose, { Schema } from "mongoose";

const forumPostSchema = new Schema(
  {
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "ForumTopic",
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "ForumPost",
      default: null, // self-referencing for nested post replies
      index: true,
    },
  },
  { timestamps: true }
);

export const ForumPost = mongoose.model("ForumPost", forumPostSchema);
