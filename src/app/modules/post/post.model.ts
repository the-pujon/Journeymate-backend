import { Schema, model } from "mongoose";
import { TPost } from "./post.interface";

const postSchema = new Schema<TPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: [String],
      default: undefined,
    },
    category: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: undefined,
    },
    premium: {
      type: Boolean,
      default: false,
    },
    upVotes: {
      type: Number,
      default: 0,
    },
    downVotes: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        comment: {
          type: Schema.Types.ObjectId,
          ref: "Comment",
          default: undefined,
        },
      },
    ],
    totalComments: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Post = model<TPost>("Post", postSchema);

export default Post;
