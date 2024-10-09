import { z } from "zod";

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
  query: z.object({
    category: z.string().optional(),
    author: z.string().optional(),
    searchTerm: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});
