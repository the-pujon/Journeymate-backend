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
