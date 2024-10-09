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

    // Set premium to true only if the user is verified, otherwise false
    const isPremium = userProfile.verified ? true : false;

    const newPost = await Post.create(
      [
        {
          ...postData,
          author: userProfile._id, // Use UserProfile._id as the author
          premium: isPremium,
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

interface GetPostsOptions {
  category?: string;
  author?: string;
  searchTerm?: string;
  sortOrder: "asc" | "desc";
}

const getPosts = async ({
  category,
  author,
  searchTerm,
  sortOrder,
}: GetPostsOptions): Promise<TPost[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};

  if (category) {
    query.category = category;
  }

  if (author) {
    const userProfile = await UserProfile.findOne({
      user: new Types.ObjectId(author),
    });
    if (userProfile) {
      query.author = userProfile._id;
    } else {
      // If no user profile found, return an empty array
      return [];
    }
  }

  if (searchTerm) {
    query.$or = [
      { title: { $regex: searchTerm, $options: "i" } },
      { content: { $regex: searchTerm, $options: "i" } },
      { tags: { $in: [new RegExp(searchTerm, "i")] } },
    ];
  }

  const sortOptions: { [key: string]: "asc" | "desc" } = {
    upVotes: sortOrder,
  };

  const posts = await Post.find(query)
    .sort(sortOptions)
    .populate({
      path: "author",
      select: "user profilePicture bio verified",
      populate: {
        path: "user",
        select: "name email",
      },
    });

  return posts;
};

const getPostsByUserId = async (
  userId: string,
  sortOrder: "asc" | "desc",
): Promise<TPost[]> => {
  const userProfile = await UserProfile.findOne({
    user: new Types.ObjectId(userId),
  });

  if (!userProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "User profile not found");
  }

  const sortOptions: { [key: string]: "asc" | "desc" } = {
    upVotes: sortOrder,
  };

  const posts = await Post.find({ author: userProfile._id })
    .sort(sortOptions)
    .populate({
      path: "author",
      select: "user profilePicture bio verified",
      populate: {
        path: "user",
        select: "name email",
      },
    });

  return posts;
};

const getPostById = async (id: string): Promise<TPost | null> => {
  const post = await Post.findById(id).populate({
    path: "author",
    select: "user profilePicture bio verified",
    populate: {
      path: "user",
      select: "name email",
    },
  });

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  }

  return post;
};

const updatePost = async (
  postId: string,
  userId: string,
  updateData: Partial<TPost>,
): Promise<TPost | null> => {
  // Find the user's profile
  const userProfile = await UserProfile.findOne({
    user: new Types.ObjectId(userId),
  });

  if (!userProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "User profile not found");
  }

  // Find the post and check if the user is the author
  const post = await Post.findOne({ _id: postId, author: userProfile._id });

  if (!post) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Post not found or you're not authorized to update this post",
    );
  }

  // Remove premium, upVotes, and downVotes from updateData
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { premium, upVotes, downVotes, ...allowedUpdates } = updateData;

  // Update the post with only allowed fields
  Object.assign(post, allowedUpdates);
  await post.save();

  // Populate the author information
  await post.populate({
    path: "author",
    select: "user profilePicture bio verified",
    populate: {
      path: "user",
      select: "name email",
    },
  });

  return post;
};

const deletePost = async (
  postId: string,
  userId: string,
  userRole: string,
): Promise<TPost | null> => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  }

  const userProfile = await UserProfile.findOne({
    user: new Types.ObjectId(userId),
  });

  if (!userProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "User profile not found");
  }

  // Check if the user is the author of the post or an admin
  if (
    post.author.toString() !== userProfile._id.toString() &&
    userRole !== "admin"
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this post",
    );
  }

  // Remove the post from the user's posts array
  await UserProfile.updateOne(
    { _id: post.author },
    { $pull: { posts: { post: post._id } } },
  );

  // Delete the post
  const deletedPost = await Post.findByIdAndDelete(postId);

  return deletedPost;
};

export const PostService = {
  createPost,
  getPosts,
  getPostsByUserId,
  getPostById,
  updatePost,
  deletePost,
};
