import UserProfile from "./user.model";
import { TUserProfile } from "./user.interface";
import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { AuthModel } from "../auth/auth.model";

const getUsers = async (searchQuery?: string): Promise<TUserProfile[]> => {
  // Define the search filter if a search query is provided
  const filter = searchQuery
    ? {
        $or: [
          { "user.name": { $regex: new RegExp(searchQuery, "i") } },
          { "user.email": { $regex: new RegExp(searchQuery, "i") } },
        ],
      }
    : {};

  // Fetch the user profiles and populate the user, followers, and following fields
  const users = await UserProfile.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $match: filter },
    {
      $lookup: {
        from: "userprofiles",
        localField: "following.userProfile",
        foreignField: "_id",
        as: "followingProfiles",
      },
    },
    {
      $lookup: {
        from: "userprofiles",
        localField: "followers.userProfile",
        foreignField: "_id",
        as: "followerProfiles",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "followingProfiles.user",
        foreignField: "_id",
        as: "followingUsers",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "followerProfiles.user",
        foreignField: "_id",
        as: "followerUsers",
      },
    },
    {
      $project: {
        _id: 1,
        user: { _id: 1, name: 1, email: 1 },
        profilePicture: 1,
        bio: 1,
        verified: 1,
        following: {
          $map: {
            input: "$followingProfiles",
            as: "profile",
            in: {
              _id: "$$profile._id",
              user: {
                $let: {
                  vars: {
                    userObj: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$followingUsers",
                            cond: { $eq: ["$$this._id", "$$profile.user"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: {
                    _id: "$$userObj._id",
                    name: "$$userObj.name",
                    email: "$$userObj.email",
                  },
                },
              },
              verified: "$$profile.verified",
              profilePicture: "$$profile.profilePicture",
            },
          },
        },
        followers: {
          $map: {
            input: "$followerProfiles",
            as: "profile",
            in: {
              _id: "$$profile._id",
              user: {
                $let: {
                  vars: {
                    userObj: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$followerUsers",
                            cond: { $eq: ["$$this._id", "$$profile.user"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: {
                    _id: "$$userObj._id",
                    name: "$$userObj.name",
                    email: "$$userObj.email",
                  },
                },
              },
              verified: "$$profile.verified",
              profilePicture: "$$profile.profilePicture",
            },
          },
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return users;
};

const getUserById = async (userId: string): Promise<TUserProfile | null> => {
  const user = await UserProfile.findOne({ user: new Types.ObjectId(userId) })
    .populate("user", "name email")
    .populate({
      path: "following.userProfile",
      //select: "user verified profilePicture",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate({
      path: "followers.userProfile",
      //select: "user verified profilePicture",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate({
      path: "posts.post",
    });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

const updateUserProfile = async (
  userId: string,
  updateData: { name?: string; profilePicture?: string; bio?: string },
): Promise<TUserProfile | null> => {
  const session = await UserProfile.startSession();
  session.startTransaction();

  try {
    const userProfile = await UserProfile.findOne({
      user: new Types.ObjectId(userId),
    }).session(session);

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    if (updateData.name) {
      await AuthModel.findByIdAndUpdate(userId, {
        name: updateData.name,
      }).session(session);
    }

    if (updateData.profilePicture) {
      userProfile.profilePicture = updateData.profilePicture;
    }

    if (updateData.bio) {
      userProfile.bio = updateData.bio;
    }

    await userProfile.save({ session });

    await session.commitTransaction();
    session.endSession();

    return userProfile.populate("user", "name email role");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const updateUserFollowing = async (
  followerUserId: string,
  followingUserId: string,
): Promise<{
  follower: TUserProfile | null;
  following: TUserProfile | null;
}> => {
  // Check if follower and following IDs are the same
  if (followerUserId === followingUserId) {
    throw new AppError(httpStatus.BAD_REQUEST, "You cannot follow yourself");
  }

  const session = await UserProfile.startSession();
  session.startTransaction();

  try {
    const followerProfile = await UserProfile.findOne({
      user: new Types.ObjectId(followerUserId),
    }).session(session);

    const followingProfile = await UserProfile.findOne({
      user: new Types.ObjectId(followingUserId),
    }).session(session);

    if (!followerProfile || !followingProfile) {
      throw new AppError(httpStatus.NOT_FOUND, "User profile not found");
    }

    // Check if already following
    const isAlreadyFollowing = followerProfile.following?.some(
      (f) => f.userProfile.toString() === followingProfile._id.toString(),
    );

    if (isAlreadyFollowing) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You are already following this user",
      );
    }

    // Update follower's following list
    followerProfile.following?.push({ userProfile: followingProfile._id });
    await followerProfile.save({ session });

    // Update following's followers list
    followingProfile.followers?.push({ userProfile: followerProfile._id });
    await followingProfile.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      follower: await followerProfile.populate({
        path: "user",
        select: "name email",
      }),
      following: await followingProfile.populate({
        path: "user",
        select: "name email",
      }),
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const unfollowUser = async (
  followerUserId: string,
  unfollowUserId: string,
): Promise<{
  follower: TUserProfile | null;
  unfollowed: TUserProfile | null;
}> => {
  if (followerUserId === unfollowUserId) {
    throw new AppError(httpStatus.BAD_REQUEST, "You cannot unfollow yourself");
  }

  const session = await UserProfile.startSession();
  session.startTransaction();

  try {
    const followerProfile = await UserProfile.findOne({
      user: new Types.ObjectId(followerUserId),
    }).session(session);

    const unfollowedProfile = await UserProfile.findOne({
      user: new Types.ObjectId(unfollowUserId),
    }).session(session);

    if (!followerProfile || !unfollowedProfile) {
      throw new AppError(httpStatus.NOT_FOUND, "User profile not found");
    }

    // Initialize following and followers arrays if they don't exist
    if (!followerProfile.following) followerProfile.following = [];
    if (!unfollowedProfile.followers) unfollowedProfile.followers = [];

    // Check if already following
    const isFollowing = followerProfile.following.some(
      (f) =>
        f.userProfile &&
        f.userProfile.toString() === unfollowedProfile._id.toString(),
    );

    if (!isFollowing) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You are not following this user",
      );
    }

    // Remove unfollowed user from follower's following list
    followerProfile.following = followerProfile.following.filter(
      (f) =>
        f.userProfile &&
        f.userProfile.toString() !== unfollowedProfile._id.toString(),
    );
    await followerProfile.save({ session });

    // Remove follower from unfollowed user's followers list
    unfollowedProfile.followers = unfollowedProfile.followers.filter(
      (f) =>
        f.userProfile &&
        f.userProfile.toString() !== followerProfile._id.toString(),
    );
    await unfollowedProfile.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      follower: await followerProfile.populate({
        path: "user",
        select: "name email",
      }),
      unfollowed: await unfollowedProfile.populate({
        path: "user",
        select: "name email",
      }),
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

//TODO: Test this
const requestVerification = async (
  userId: string,
  paymentIntentId: string,
): Promise<TUserProfile | null> => {
  const userProfile = await UserProfile.findOne({
    user: new Types.ObjectId(userId),
  });

  if (!userProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "User profile not found");
  }

  if (userProfile.verified) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is already verified");
  }

  if (userProfile.totalUpvotes < 1) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User must have at least 1 upvote to request verification",
    );
  }

  // TODO: Implement actual payment verification with AAMARPAY or Stripe
  if (!paymentIntentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment information is missing",
    );
  }

  userProfile.verified = true;
  userProfile.verificationRequestDate = new Date();
  await userProfile.save();

  return userProfile;
};

export const UserService = {
  getUsers,
  getUserById,
  updateUserProfile,
  updateUserFollowing,
  unfollowUser,
  requestVerification,
};
