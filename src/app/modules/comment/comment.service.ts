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

export const CommentService = {
  createComment,
};
