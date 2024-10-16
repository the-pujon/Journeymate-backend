import { Schema, model } from "mongoose";
import { TComment } from "./comment.interface";

const commentSchema = new Schema<TComment>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    upVotes: {
      type: Number,
      default: 0,
    },
    downVotes: {
      type: Number,
      default: 0,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    isUpVoted: {
      type: Boolean,
      default: false,
    },
    isDownVoted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Comment = model<TComment>("Comment", commentSchema);

export default Comment;
