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

export const getCommentsByPostIdValidation = z.object({
  params: z.object({
    postId: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid post ID",
    }),
  }),
});

export const editCommentValidation = z.object({
  params: z.object({
    commentId: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid comment ID",
    }),
  }),
  body: z.object({
    content: z.string().min(1, "Comment content is required"),
  }),
});

export const deleteCommentValidation = z.object({
  params: z.object({
    commentId: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid comment ID",
    }),
  }),
});
