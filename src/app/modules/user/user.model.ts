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
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    following: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    posts: [
      {
        author: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const UserProfile = model<TUserProfile>("UserProfile", userProfileSchema);

export default UserProfile;
