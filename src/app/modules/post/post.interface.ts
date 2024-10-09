import { Types } from "mongoose";

export interface TPost {
  author: Types.ObjectId;
  title: string;
  content: string;
  image?: string[];
  category: string;
  tags?: string[];
  premium?: boolean;
  upVotes?: number;
  downVotes?: number;
  comments?: Types.ObjectId[];
  totalComments?: number;
}
