import { Types } from "mongoose";
import Comment from "./comment.model";
import Post from "../post/post.model";
import UserProfile from "../user/user.model";
import { TComment } from "./comment.interface";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

const createComment = async (
  userId: string,
  content: string,
  postId: string,
): Promise<TComment> => {
  const session = await Comment.startSession();
  session.startTransaction();

  try {
    const post = await Post.findById(postId).session(session);
    if (!post) {
      throw new AppError(httpStatus.NOT_FOUND, "Post not found");
    }

    const userProfile = await UserProfile.findOne({
      user: new Types.ObjectId(userId),
    }).session(session);
    if (!userProfile) {
      throw new AppError(httpStatus.NOT_FOUND, "User profile not found");
    }

    const newComment = await Comment.create(
      [
        {
          author: post.author, // Author is from the post
          content,
          post: new Types.ObjectId(postId),
          user: new Types.ObjectId(userId), // User who created the comment
        },
      ],
      { session },
    );

    if (!newComment || newComment.length === 0) {
      throw new AppError(httpStatus.BAD_REQUEST, "Failed to create comment");
    }

    // Increment the totalComments count in the post
    await Post.findByIdAndUpdate(
      postId,
      { $inc: { totalComments: 1 } },
      { session },
    );

    await session.commitTransaction();
    return newComment[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getCommentsByPostId = async (postId: string): Promise<TComment[]> => {
  const comments = await Comment.find({ post: new Types.ObjectId(postId) })
    .sort({ createdAt: -1 })
    .populate({
      path: "user",
      select: "name email",
    })
    .populate({
      path: "author",
      select: "user profilePicture bio verified",
      populate: {
        path: "user",
        select: "name email",
      },
    });

  return comments;
};

const editComment = async (
  userId: string,
  commentId: string,
  content: string,
): Promise<TComment> => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found");
  }

  // Check if the user is the author of the comment
  if (comment.user!.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to edit this comment",
    );
  }

  comment.content = content;
  await comment.save();

  return comment;
};

const deleteComment = async (
  userId: string,
  commentId: string,
): Promise<void> => {
  const session = await Comment.startSession();
  session.startTransaction();

  try {
    const comment = await Comment.findById(commentId).session(session);

    if (!comment) {
      throw new AppError(httpStatus.NOT_FOUND, "Comment not found");
    }

    // Check if the user is the author of the comment
    if (comment.user!.toString() !== userId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to delete this comment",
      );
    }

    // Delete the comment
    await Comment.findByIdAndDelete(commentId).session(session);

    // Decrease the totalComments count in the post and remove the comment ID from the comments array
    await Post.findByIdAndUpdate(
      comment.post,
      {
        $inc: { totalComments: -1 },
        $pull: { comments: { comment: new Types.ObjectId(commentId) } },
      },
      { session },
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const CommentService = {
  createComment,
  getCommentsByPostId,
  editComment,
  deleteComment,
};
