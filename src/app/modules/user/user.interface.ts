import { Types } from "mongoose";

export interface TUserProfile {
  user: Types.ObjectId;
  profilePicture?: string;
  bio?: string;
  followers?: {
    user: Types.ObjectId;
  }[];
  following?: {
    user: Types.ObjectId;
  }[];
  posts?: {
    author: Types.ObjectId;
  }[];
  verified?: boolean;
}
