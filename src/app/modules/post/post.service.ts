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

export const PostService = {
  createPost,
  getPosts,
  getPostsByUserId,
  getPostById,
};
