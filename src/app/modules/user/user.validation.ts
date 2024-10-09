import { z } from "zod";

export const updateUserProfileValidation = z.object({
  body: z.object({
    name: z.string().optional(),
    profilePicture: z.string().url().optional(),
    bio: z.string().max(500).optional(),
  }),
});
