"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const comment_model_1 = __importDefault(require("./comment.model"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const user_model_1 = __importDefault(require("../user/user.model"));
const post_model_1 = __importDefault(require("../post/post.model"));
const createComment = (userId, content, postId, parentCommentId) => __awaiter(void 0, void 0, void 0, function* () {
    const userProfile = yield user_model_1.default.findOne({ user: userId });
    if (!userProfile) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User profile not found");
    }
    const comment = yield comment_model_1.default.create({
        author: userProfile._id,
        content,
        post: postId,
        user: userId,
        parentComment: parentCommentId,
    });
    // Update the post's totalComments and comments array
    yield post_model_1.default.findByIdAndUpdate(postId, {
        $inc: { totalComments: 1 },
        $push: { comments: { comment: comment._id } },
    });
    if (parentCommentId) {
        yield comment_model_1.default.findByIdAndUpdate(parentCommentId, {
            $push: { replies: comment._id },
        });
    }
    return comment;
});
const getCommentsByPostId = (postId) => __awaiter(void 0, void 0, void 0, function* () {
    return comment_model_1.default.find({ post: postId, parentComment: null })
        .populate({
        path: "author",
        populate: {
            path: "user",
        },
    })
        .populate({
        path: "replies",
        populate: {
            path: "author",
            populate: {
                path: "user",
            },
            //select: "name avatar",
        },
    })
        .sort({ createdAt: -1 });
});
const editComment = (userId, commentId, content) => __awaiter(void 0, void 0, void 0, function* () {
    const comment = yield comment_model_1.default.findById(commentId);
    if (!comment) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Comment not found");
    }
    if (comment.user.toString() !== userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You are not authorized to edit this comment");
    }
    comment.content = content;
    yield comment.save();
    return comment;
});
const deleteComment = (userId, commentId) => __awaiter(void 0, void 0, void 0, function* () {
    const comment = yield comment_model_1.default.findById(commentId);
    if (!comment) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Comment not found");
    }
    if (comment.user.toString() !== userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You are not authorized to delete this comment");
    }
    yield comment_model_1.default.deleteOne({ _id: commentId });
    // Update the post's totalComments and comments array
    yield post_model_1.default.findByIdAndUpdate(comment.post, {
        $inc: { totalComments: -1 },
        $pull: { comments: { comment: commentId } },
    });
    if (comment.parentComment) {
        yield comment_model_1.default.findByIdAndUpdate(comment.parentComment, {
            $pull: { replies: commentId },
        });
    }
});
const voteComment = (userId, commentId, voteType) => __awaiter(void 0, void 0, void 0, function* () {
    const comment = yield comment_model_1.default.findById(commentId);
    if (!comment) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Comment not found");
    }
    if (voteType === "up") {
        if (comment.isUpVoted) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You have already upvoted this comment");
        }
        comment.upVotes += 1;
        if (comment.isDownVoted) {
            comment.downVotes -= 1;
        }
        comment.isUpVoted = true;
        comment.isDownVoted = false;
    }
    else {
        if (comment.isDownVoted) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You have already downvoted this comment");
        }
        comment.downVotes += 1;
        if (comment.isUpVoted) {
            comment.upVotes -= 1;
        }
        comment.isDownVoted = true;
        comment.isUpVoted = false;
    }
    yield comment.save();
    return comment;
});
const getCommentService = () => __awaiter(void 0, void 0, void 0, function* () {
    return comment_model_1.default.find()
        .populate({
        path: "author",
        populate: {
            path: "user",
        },
    })
        .populate({
        path: "replies",
        populate: {
            path: "author",
            populate: {
                path: "user",
            },
            //select: "name avatar",
        },
    });
});
exports.CommentService = {
    createComment,
    getCommentsByPostId,
    editComment,
    deleteComment,
    voteComment,
    getCommentService,
};
