"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const postSchema = new mongoose_1.Schema({
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "UserProfile",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    image: {
        type: [String],
        default: undefined,
    },
    category: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        default: undefined,
    },
    premium: {
        type: Boolean,
        default: false,
    },
    upVotes: {
        type: Number,
        default: 0,
    },
    downVotes: {
        type: Number,
        default: 0,
    },
    comments: [
        {
            comment: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Comment",
                default: undefined,
            },
        },
    ],
    totalComments: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
const Post = (0, mongoose_1.model)("Post", postSchema);
exports.default = Post;
