"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVoteValidation = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
exports.getVoteValidation = zod_1.z.object({
    params: zod_1.z
        .object({
        postId: zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid post ID",
        }),
    })
        .optional(),
});
