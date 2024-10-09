import { Types } from "mongoose";

export interface TUserProfile {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  profilePicture?: string;
  bio?: string;
  followers?: {
    userProfile: Types.ObjectId;
  }[];
  following?: {
    userProfile: Types.ObjectId;
  }[];
  posts?: {
    author: Types.ObjectId;
  }[];
  verified: boolean;
  verificationRequestDate?: Date;
  totalUpvotes: number;
}

export interface VerificationRequest {
  userId: string;
  paymentIntentId: string;
}
