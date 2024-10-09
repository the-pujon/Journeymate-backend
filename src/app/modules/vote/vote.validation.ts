import { z } from "zod";
import { Types } from "mongoose";

export const getVoteValidation = z.object({
  params: z.object({
    postId: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid post ID",
    }),
  }),
});
