"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userProfileSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    profilePicture: {
        type: String,
    },
    bio: {
        type: String,
    },
    followers: [
        {
            userProfile: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "UserProfile",
            },
        },
    ],
    following: [
        {
            userProfile: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "UserProfile",
            },
        },
    ],
    posts: [
        {
            post: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Post",
            },
        },
    ],
    verified: {
        type: Boolean,
        default: false,
    },
    verificationRequestDate: {
        type: Date,
    },
    totalUpvotes: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
const UserProfile = (0, mongoose_1.model)("UserProfile", userProfileSchema);
exports.default = UserProfile;
