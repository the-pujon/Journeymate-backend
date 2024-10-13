"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voteCommentValidation = exports.deleteCommentValidation = exports.editCommentValidation = exports.getCommentsByPostIdValidation = exports.createCommentValidation = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
exports.createCommentValidation = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, "Comment content is required"),
        post: zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid post ID",
        }),
        parentComment: zod_1.z
            .string()
            .refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid parent comment ID",
        })
            .nullable()
            .optional(),
    }),
});
exports.getCommentsByPostIdValidation = zod_1.z.object({
    params: zod_1.z
        .object({
        postId: zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid post ID",
        }),
    })
        .optional(),
});
exports.editCommentValidation = zod_1.z.object({
    params: zod_1.z
        .object({
        commentId: zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid comment ID",
        }),
    })
        .optional(),
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, "Comment content is required"),
    }),
});
exports.deleteCommentValidation = zod_1.z.object({
    params: zod_1.z
        .object({
        commentId: zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid comment ID",
        }),
    })
        .optional(),
});
exports.voteCommentValidation = zod_1.z.object({
    params: zod_1.z
        .object({
        commentId: zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid comment ID",
        }),
    })
        .optional(),
    body: zod_1.z.object({
        voteType: zod_1.z.enum(["up", "down"], {
            required_error: "Vote type is required",
            invalid_type_error: "Vote type must be either 'up' or 'down'",
        }),
    }),
});
