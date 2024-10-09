import { Types } from "mongoose";

export interface TComment {
  author: Types.ObjectId;
  content: string;
  post: Types.ObjectId;
  upVotes?: number;
  downVotes?: number;
  user?: Types.ObjectId;
}
