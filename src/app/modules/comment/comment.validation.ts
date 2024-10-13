import { z } from "zod";
import { Types } from "mongoose";

export const createCommentValidation = z.object({
  body: z.object({
    content: z.string().min(1, "Comment content is required"),
    post: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid post ID",
    }),
    parentComment: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid parent comment ID",
      })
      .nullable()
      .optional(),
  }),
});

export const getCommentsByPostIdValidation = z.object({
  params: z
    .object({
      postId: z.string().refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid post ID",
      }),
    })
    .optional(),
});

export const editCommentValidation = z.object({
  params: z
    .object({
      commentId: z.string().refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid comment ID",
      }),
    })
    .optional(),
  body: z.object({
    content: z.string().min(1, "Comment content is required"),
  }),
});

export const deleteCommentValidation = z.object({
  params: z
    .object({
      commentId: z.string().refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid comment ID",
      }),
    })
    .optional(),
});

export const voteCommentValidation = z.object({
  params: z
    .object({
      commentId: z.string().refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid comment ID",
      }),
    })
    .optional(),
  body: z.object({
    voteType: z.enum(["up", "down"], {
      required_error: "Vote type is required",
      invalid_type_error: "Vote type must be either 'up' or 'down'",
    }),
  }),
});
