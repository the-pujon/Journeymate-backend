"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificationRequestValidation = exports.unfollowUserValidation = exports.updateUserFollowingValidation = exports.updateUserProfileValidation = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
exports.updateUserProfileValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        profilePicture: zod_1.z.string().url().optional(),
        bio: zod_1.z.string().max(500).optional(),
    }),
});
exports.updateUserFollowingValidation = zod_1.z.object({
    body: zod_1.z
        .object({
        followingId: zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid followingId",
        }),
    })
        .optional(),
});
exports.unfollowUserValidation = zod_1.z.object({
    body: zod_1.z
        .object({
        unfollowId: zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid unfollowId",
        }),
    })
        .optional(),
});
exports.verificationRequestValidation = zod_1.z.object({
    body: zod_1.z.object({
        paymentIntentId: zod_1.z.string(),
    }),
});
