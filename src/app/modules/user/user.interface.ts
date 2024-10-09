import { Types } from "mongoose";

export interface TUserProfile {
  user: Types.ObjectId;
  profilePicture?: string;
  bio?: string;
  followers?: Types.ObjectId[];
  following?: Types.ObjectId[];
  posts?: Types.ObjectId[];
  verified?: boolean;
}
