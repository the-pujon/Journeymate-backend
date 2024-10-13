"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downvotePostValidation = exports.upvotePostValidation = exports.deletePostValidation = exports.updatePostValidation = exports.getPostByIdValidation = exports.getPostsByUserIdValidation = exports.getPostsValidation = exports.createPostValidation = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
exports.createPostValidation = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).max(255),
        content: zod_1.z.string().min(1),
        image: zod_1.z.array(zod_1.z.string().url()).optional(),
        category: zod_1.z.string().min(1),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        premium: zod_1.z.boolean().optional(),
    }),
});
exports.getPostsValidation = zod_1.z.object({
    query: zod_1.z
        .object({
        category: zod_1.z.string().optional(),
        author: zod_1.z.string().optional(),
        searchTerm: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional().default("desc"),
    })
        .optional(),
});
exports.getPostsByUserIdValidation = zod_1.z.object({
    params: zod_1.z
        .object({
        userId: zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid user ID",
        }),
    })
        .optional(),
    query: zod_1.z
        .object({
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional().default("desc"),
    })
        .optional(),
});
exports.getPostByIdValidation = zod_1.z.object({
    params: zod_1.z
        .object({
        id: zod_1.z
            .string()
            .refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid post ID",
        })
            .optional(),
    })
        .optional(),
});
exports.updatePostValidation = zod_1.z.object({
    params: zod_1.z
        .object({
        id: zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid post ID",
        }),
    })
        .optional(),
    body: zod_1.z
        .object({
        title: zod_1.z.string().min(1).max(255).optional(),
        content: zod_1.z.string().min(1).optional(),
        image: zod_1.z.array(zod_1.z.string().url()).optional(),
        category: zod_1.z.string().min(1).optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
    })
        .strict(), // This ensures no extra fields are allowed
});
exports.deletePostValidation = zod_1.z.object({
    params: zod_1.z
        .object({
        id: zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid post ID",
        }),
    })
        .optional(),
});
exports.upvotePostValidation = zod_1.z.object({
    params: zod_1.z
        .object({
        id: zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid post ID",
        }),
    })
        .optional(),
});
exports.downvotePostValidation = zod_1.z.object({
    params: zod_1.z
        .object({
        id: zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid post ID",
        }),
    })
        .optional(),
});
