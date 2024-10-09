import { z } from "zod";
import { Types } from "mongoose";

export const updateUserProfileValidation = z.object({
  body: z.object({
    name: z.string().optional(),
    profilePicture: z.string().url().optional(),
    bio: z.string().max(500).optional(),
  }),
});

export const updateUserFollowingValidation = z.object({
  body: z.object({
    followingId: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid followingId",
    }),
  }),
});

export const unfollowUserValidation = z.object({
  body: z.object({
    unfollowId: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid unfollowId",
    }),
  }),
});

export const verificationRequestValidation = z.object({
  body: z.object({
    paymentIntentId: z.string(),
  }),
});
