"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "UserProfile",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    post: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },
    upVotes: {
        type: Number,
        default: 0,
    },
    downVotes: {
        type: Number,
        default: 0,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    parentComment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Comment",
    },
    replies: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],
    isUpVoted: {
        type: Boolean,
        default: false,
    },
    isDownVoted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const Comment = (0, mongoose_1.model)("Comment", commentSchema);
exports.default = Comment;
