import { Schema } from "mongoose";
import { IVote } from "./vote.interface";
import { model } from "mongoose";

const voteSchema = new Schema<IVote>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    voteType: {
      type: String,
      enum: ["upvote", "downvote"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to ensure a user can only have one vote per post
voteSchema.index({ user: 1, post: 1 }, { unique: true });

const Vote = model<IVote>("Vote", voteSchema);

export default Vote;
