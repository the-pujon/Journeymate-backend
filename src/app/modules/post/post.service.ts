import { Types } from "mongoose";
import Post from "./post.model";
import UserProfile from "../user/user.model";
import Vote from "../vote/vote.model";
import Comment from "../comment/comment.model"; // Add this import
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
      //select: "user profilePicture bio verified", // Select the fields you want to include
      populate: {
        path: "user",
        select: "name email",
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
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  currentUserId?: string;
}

const getPosts = async ({
  category,
  author,
  searchTerm,
  sortOrder = "desc",
  page = 1,
  limit = 10,
  currentUserId,
}: GetPostsOptions): Promise<{
  posts: TPost[];
  totalPosts: number;
  hasMore: boolean;
}> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};

  // Category filter
  if (category) {
    query.category = category;
  }

  // Author filter
  if (author) {
    const userProfile = await UserProfile.findOne({
      user: new Types.ObjectId(author),
    });
    if (userProfile) {
      query.author = userProfile._id;
    } else {
      return { posts: [], totalPosts: 0, hasMore: false };
    }
  }

  // Search functionality
  if (searchTerm) {
    const searchRegex = new RegExp(searchTerm, "i");
    query.$or = [
      { title: { $regex: searchRegex } },
      { content: { $regex: searchRegex } },
      { tags: { $in: [searchRegex] } },
    ];

    // Search for author name in UserProfile
    const matchingProfiles = await UserProfile.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $match: {
          "userDetails.name": { $regex: searchRegex },
        },
      },
      {
        $project: { _id: 1 },
      },
    ]);

    if (matchingProfiles.length > 0) {
      query.$or.push({
        author: { $in: matchingProfiles.map((profile) => profile._id) },
      });
    }
  }

  // Premium post handling
  let userIsVerified = false;
  if (currentUserId) {
    const currentUserProfile = await UserProfile.findOne({
      user: new Types.ObjectId(currentUserId),
    });
    userIsVerified = currentUserProfile?.verified || false;
  }

  if (!userIsVerified) {
    query.premium = { $ne: true };
  }

  const skip = (page - 1) * limit;

  // Count total posts
  const totalPosts = await Post.countDocuments(query);

  // Sorting
  let sortOptions: { [key: string]: "asc" | "desc" } = {};
  if (sortOrder === "asc" || sortOrder === "desc") {
    sortOptions = { createdAt: sortOrder };
  } else {
    sortOptions = { createdAt: "desc" }; // Default sort
  }

  // Execute query
  const posts = await Post.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate({
      path: "author",
      populate: [
        {
          path: "user",
          select: "name email",
        },
        {
          path: "posts",
          options: { limit: 2 },
          populate: {
            path: "post",
            select:
              "title createdAt image category tags premium upVotes downVotes totalComments",
          },
        },
      ],
    });

  const hasMore = totalPosts > skip + posts.length;

  return { posts, totalPosts, hasMore };
};

const getPostsByUserId = async (
  userId: string,
  sortOrder: "asc" | "desc" | undefined,
): Promise<TPost[]> => {
  const userProfile = await UserProfile.findOne({
    user: new Types.ObjectId(userId),
  });

  if (!userProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "User profile not found");
  }

  let query = Post.find({ author: userProfile._id });

  // Apply sorting only if sortOrder is specified
  if (sortOrder) {
    const sortOptions: { [key: string]: "asc" | "desc" } = {
      upVotes: sortOrder,
    };
    query = query.sort(sortOptions);
  }

  const posts = await query.populate({
    path: "author",
    populate: [
      {
        path: "user",
        select: "name email",
      },
      {
        path: "posts",
        options: { limit: 2 },
        populate: {
          path: "post",
        },
      },
    ],
  });

  return posts;
};

const getPostById = async (id: string): Promise<TPost | null> => {
  const post = await Post.findById(id).populate({
    path: "author",
    select: "user profilePicture bio verified following followers",
    //populate: {
    //  path: "user",
    //  select: "name email",
    //},
    populate: [
      {
        path: "user",
        select: "name email",
      },
      {
        path: "posts",
      },
    ],
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
  const session = await Post.startSession();
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
      { session },
    );

    // Delete all comments associated with this post
    await Comment.deleteMany({ post: post._id }).session(session);

    // Delete all votes associated with this post
    await Vote.deleteMany({ post: post._id }).session(session);

    // Delete the post
    const deletedPost = await Post.findByIdAndDelete(postId).session(session);

    await session.commitTransaction();
    return deletedPost;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const upvotePost = async (postId: string, userId: string): Promise<TPost> => {
  const session = await Post.startSession();
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

    // Check if the user has already voted on this post
    const existingVote = await Vote.findOne({
      user: userId,
      post: postId,
    }).session(session);

    if (existingVote) {
      if (existingVote.voteType === "upvote") {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "You have already upvoted this post",
        );
      } else {
        // Change downvote to upvote
        existingVote.voteType = "upvote";
        await existingVote.save({ session });
        post.upVotes! += 1;
        post.downVotes! -= 1;
      }
    } else {
      // Create new upvote
      await Vote.create([{ user: userId, post: postId, voteType: "upvote" }], {
        session,
      });
      post.upVotes! += 1;
    }

    await post.save({ session });

    // Update author's totalUpvotes
    const authorProfile = await UserProfile.findById(post.author).session(
      session,
    );
    if (authorProfile) {
      authorProfile.totalUpvotes += 1;
      await authorProfile.save({ session });
    }

    await session.commitTransaction();
    return post;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const downvotePost = async (postId: string, userId: string): Promise<TPost> => {
  const session = await Post.startSession();
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

    // Check if the user has already voted on this post
    const existingVote = await Vote.findOne({
      user: userId,
      post: postId,
    }).session(session);

    if (existingVote) {
      if (existingVote.voteType === "downvote") {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "You have already downvoted this post",
        );
      } else {
        // Change upvote to downvote
        existingVote.voteType = "downvote";
        await existingVote.save({ session });
        post.upVotes! -= 1;
        post.downVotes! += 1;

        // Decrease author's totalUpvotes
        const authorProfile = await UserProfile.findById(post.author).session(
          session,
        );
        if (authorProfile) {
          authorProfile.totalUpvotes = Math.max(
            authorProfile.totalUpvotes - 1,
            0,
          );
          await authorProfile.save({ session });
        }
      }
    } else {
      // Create new downvote
      await Vote.create(
        [{ user: userId, post: postId, voteType: "downvote" }],
        { session },
      );
      post.downVotes! += 1;
    }

    await post.save({ session });

    await session.commitTransaction();
    return post;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getAllPosts = async (): Promise<TPost[]> => {
  const posts = await Post.find();
  return posts;
};

export const PostService = {
  createPost,
  getPosts,
  getPostsByUserId,
  getPostById,
  updatePost,
  deletePost,
  upvotePost,
  downvotePost,
  getAllPosts,
};
