import { Types } from "mongoose";

export interface IVote {
  user: Types.ObjectId;
  post: Types.ObjectId;
  voteType: "upvote" | "downvote";
}
