"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
const voteSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    post: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },
    voteType: {
        type: String,
        enum: ["upvote", "downvote"],
        required: true,
    },
}, {
    timestamps: true,
});
// Compound index to ensure a user can only have one vote per post
voteSchema.index({ user: 1, post: 1 }, { unique: true });
const Vote = (0, mongoose_2.model)("Vote", voteSchema);
exports.default = Vote;
