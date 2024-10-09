import { Types } from "mongoose";
import Post from "./post.model";
import UserProfile from "../user/user.model";
import { TPost } from "./post.interface";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

const createPost = async (
  userId: string,
  postData: Partial<TPost>,
): Promise<TPost> => {
  const session = await Post.startSession();
  session.startTransaction();

  try {
    // Find the UserProfile
    const userProfile = await UserProfile.findOne({
      user: new Types.ObjectId(userId),
    }).session(session);

    if (!userProfile) {
      throw new AppError(httpStatus.NOT_FOUND, "User profile not found");
    }

    const newPost = await Post.create(
      [
        {
          ...postData,
          author: userProfile._id, // Use UserProfile._id as the author
        },
      ],
      { session },
    );

    if (!newPost || newPost.length === 0) {
      throw new AppError(httpStatus.BAD_REQUEST, "Failed to create post");
    }

    const createdPost = newPost[0];

    // Update user profile with the new post
    userProfile.posts = userProfile.posts || [];
    userProfile.posts.push({ post: createdPost._id });
    await userProfile.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Populate the author field
    await createdPost.populate({
      path: "author",
      select: "user profilePicture bio verified", // Select the fields you want to include
      populate: {
        path: "user",
        select: "name email", // Populate user details you want to include
      },
    });

    return createdPost;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const PostService = {
  createPost,
};
