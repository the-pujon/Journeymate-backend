import { z } from "zod";
import { Types } from "mongoose";

export const createCommentValidation = z.object({
  body: z.object({
    content: z.string().min(1, "Comment content is required"),
    post: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid post ID",
    }),
  }),
});
