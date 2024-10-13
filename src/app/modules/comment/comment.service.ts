import { Types } from "mongoose";
import Comment from "./comment.model";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import UserProfile from "../user/user.model";
import Post from "../post/post.model";

const createComment = async (
  userId: string,
  content: string,
  postId: string,
  parentCommentId?: string,
) => {
  console.log("userId", userId);
  const userProfile = await UserProfile.findOne({ user: userId });
  console.log("userProfile", userProfile);
  if (!userProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "User profile not found");
  }

  const comment = await Comment.create({
    author: userProfile._id,
    content,
    post: postId,
    user: userId,
    parentComment: parentCommentId,
  });

  // Update the post's totalComments and comments array
  await Post.findByIdAndUpdate(postId, {
    $inc: { totalComments: 1 },
    $push: { comments: { comment: comment._id } },
  });

  if (parentCommentId) {
    await Comment.findByIdAndUpdate(parentCommentId, {
      $push: { replies: comment._id },
    });
  }

  return comment;
};

const getCommentsByPostId = async (postId: string) => {
  return Comment.find({ post: postId, parentComment: null })
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
};

const editComment = async (
  userId: string,
  commentId: string,
  content: string,
) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found");
  }

  if (comment.user.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to edit this comment",
    );
  }

  comment.content = content;
  await comment.save();

  return comment;
};

const deleteComment = async (userId: string, commentId: string) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found");
  }

  if (comment.user.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this comment",
    );
  }

  await Comment.deleteOne({ _id: commentId });

  // Update the post's totalComments and comments array
  await Post.findByIdAndUpdate(comment.post, {
    $inc: { totalComments: -1 },
    $pull: { comments: { comment: commentId } },
  });

  if (comment.parentComment) {
    await Comment.findByIdAndUpdate(comment.parentComment, {
      $pull: { replies: commentId },
    });
  }
};

const voteComment = async (
  userId: string,
  commentId: string,
  voteType: "up" | "down",
) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found");
  }

  if (voteType === "up") {
    if (comment.isUpVoted) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You have already upvoted this comment",
      );
    }
    comment.upVotes += 1;
    if (comment.isDownVoted) {
      comment.downVotes -= 1;
    }
    comment.isUpVoted = true;
    comment.isDownVoted = false;
  } else {
    if (comment.isDownVoted) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You have already downvoted this comment",
      );
    }
    comment.downVotes += 1;
    if (comment.isUpVoted) {
      comment.upVotes -= 1;
    }
    comment.isDownVoted = true;
    comment.isUpVoted = false;
  }

  await comment.save();
  return comment;
};

const getCommentService = async () => {
  return Comment.find()
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
};

export const CommentService = {
  createComment,
  getCommentsByPostId,
  editComment,
  deleteComment,
  voteComment,
  getCommentService,
};
