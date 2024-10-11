import { Schema, model } from "mongoose";
import { TUserProfile } from "./user.interface";

const userProfileSchema = new Schema<TUserProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    profilePicture: {
      type: String,
    },
    bio: {
      type: String,
    },
    followers: [
      {
        userProfile: {
          type: Schema.Types.ObjectId,
          ref: "UserProfile",
        },
      },
    ],
    following: [
      {
        userProfile: {
          type: Schema.Types.ObjectId,
          ref: "UserProfile",
        },
      },
    ],
    posts: [
      {
        post: {
          type: Schema.Types.ObjectId,
          ref: "Post",
        },
      },
    ],
    verified: {
      type: Boolean,
      default: false,
    },
    verificationRequestDate: {
      type: Date,
    },
    totalUpvotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const UserProfile = model<TUserProfile>("UserProfile", userProfileSchema);

export default UserProfile;
