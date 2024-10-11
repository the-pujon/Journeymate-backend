import { z } from "zod";
import { Types } from "mongoose";

export const createPostValidation = z.object({
  body: z.object({
    title: z.string().min(1).max(255),
    content: z.string().min(1),
    image: z.array(z.string().url()).optional(),
    category: z.string().min(1),
    tags: z.array(z.string()).optional(),
    premium: z.boolean().optional(),
  }),
});

export const getPostsValidation = z.object({
  query: z
    .object({
      category: z.string().optional(),
      author: z.string().optional(),
      searchTerm: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    })
    .optional(),
});

export const getPostsByUserIdValidation = z.object({
  params: z
    .object({
      userId: z.string().refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid user ID",
      }),
    })
    .optional(),
  query: z
    .object({
      sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    })
    .optional(),
});

export const getPostByIdValidation = z.object({
  params: z
    .object({
      id: z
        .string()
        .refine((val) => Types.ObjectId.isValid(val), {
          message: "Invalid post ID",
        })
        .optional(),
    })
    .optional(),
});

export const updatePostValidation = z.object({
  params: z.object({
    id: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid post ID",
    }),
  }),
  body: z
    .object({
      title: z.string().min(1).max(255).optional(),
      content: z.string().min(1).optional(),
      image: z.array(z.string().url()).optional(),
      category: z.string().min(1).optional(),
      tags: z.array(z.string()).optional(),
    })
    .strict(), // This ensures no extra fields are allowed
});

export const deletePostValidation = z.object({
  params: z
    .object({
      id: z.string().refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid post ID",
      }),
    })
    .optional(),
});

export const upvotePostValidation = z.object({
  params: z
    .object({
      id: z.string().refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid post ID",
      }),
    })
    .optional(),
});

export const downvotePostValidation = z.object({
  params: z
    .object({
      id: z.string().refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid post ID",
      }),
    })
    .optional(),
});
