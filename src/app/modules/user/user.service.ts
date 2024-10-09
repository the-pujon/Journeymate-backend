import UserProfile from "./user.model";
import { TUserProfile } from "./user.interface";
import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { AuthModel } from "../auth/auth.model";

//const getUsers = async (): Promise<TUserProfile[]> => {
//  const query = UserProfile.find()
//    .populate("user", "name email")
//    .populate({
//      path: "following.user",
//      select: "name email",
//      populate: {
//        path: "userProfile",
//        select: "profilePicture",
//      },
//    })
//    .populate({
//      path: "followers.user",
//      select: "name email",
//      populate: {
//        path: "userProfile",
//        select: "profilePicture",
//      },
//    });

//  const users = await query.exec();

//  return users;
//};

//const getUsers = async (searchQuery?: string): Promise<TUserProfile[]> => {
//  const aggregationPipeline = [];

//  aggregationPipeline.push({
//    $lookup: {
//      from: "users",
//      localField: "user",
//      foreignField: "_id",
//      as: "userDetails",
//    },
//  });

//  aggregationPipeline.push({ $unwind: "$userDetails" });

//  if (searchQuery) {
//    aggregationPipeline.push({
//      $match: {
//        $or: [
//          { "userDetails.name": { $regex: searchQuery, $options: "i" } },
//          { "userDetails.email": { $regex: searchQuery, $options: "i" } },
//        ],
//      },
//    });
//  }

//  aggregationPipeline.push({
//    $project: {
//      _id: 1,
//      user: {
//        _id: "$userDetails._id",
//        name: "$userDetails.name",
//        email: "$userDetails.email",
//      },
//      verified: 1,
//      followers: 1,
//      following: 1,
//      posts: 1,
//      createdAt: 1,
//      updatedAt: 1,
//    },
//  });

//  const users = await UserProfile.aggregate(aggregationPipeline);

//  return users;
//};

//const getUsers = async (searchQuery?: string): Promise<TUserProfile[]> => {
//    const aggregationPipeline = [
//      {
//        $lookup: {
//          from: "users", // Assuming your AuthModel collection is named "users"
//          localField: "user",
//          foreignField: "_id",
//          as: "userDetails"
//        }
//      },
//      { $unwind: "$userDetails" },
//      {
//        $lookup: {
//          from: "userprofiles",
//          localField: "following.user",
//          foreignField: "user",
//          as: "followingDetails"
//        }
//      },
//      {
//        $lookup: {
//          from: "userprofiles",
//          localField: "followers.user",
//          foreignField: "user",
//          as: "followerDetails"
//        }
//      }
//    ];

//    if (searchQuery) {
//      const regex = new RegExp(searchQuery, 'i');
//      aggregationPipeline.unshift({
//        $match: {
//          $or: [
//            { "userDetails.name": { $regex: regex } },
//            { "userDetails.email": { $regex: regex } }
//          ]
//        }
//      });
//    }

//    aggregationPipeline.push({
//      $project: {
//        _id: 1,
//        user: {
//          _id: "$userDetails._id",
//          name: "$userDetails.name",
//          email: "$userDetails.email"
//        },
//        profilePicture: 1,
//        bio: 1,
//        verified: 1,
//        following: {
//          $map: {
//            input: "$followingDetails",
//            as: "follow",
//            in: {
//              user: {
//                _id: "$$follow.user",
//                name: "$$follow.userDetails.name",
//                email: "$$follow.userDetails.email"
//              }
//            }
//          }
//        },
//        followers: {
//          $map: {
//            input: "$followerDetails",
//            as: "follower",
//            in: {
//              user: {
//                _id: "$$follower.user",
//                name: "$$follower.userDetails.name",
//                email: "$$follower.userDetails.email"
//              }
//            }
//          }
//        },
//        createdAt: 1,
//        updatedAt: 1
//      }
//    });

//    const users = await UserProfile.aggregate(aggregationPipeline);

//    return users;
//  };

const getUsers = async (searchQuery?: string): Promise<TUserProfile[]> => {
  // Define the search filter if a search query is provided
  const filter = searchQuery
    ? {
        $or: [
          { name: { $regex: new RegExp(searchQuery, "i") } },
          { email: { $regex: new RegExp(searchQuery, "i") } },
        ],
      }
    : {};

  // Fetch the user profiles and populate the user, followers, and following fields
  const users = await UserProfile.find(filter)
    .populate({
      path: "user", // Populate the user field from the 'users' collection
      select: "_id name email", // Only select _id, name, and email
    })
    .populate({
      path: "following.userProfile",
      select: "user verified profilePicture",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate({
      path: "followers.userProfile",
      select: "user verified profilePicture",
      populate: {
        path: "user",
        select: "name email",
      },
    });
  //.select(
  //  "_id profilePicture bio verified following followers createdAt updatedAt",
  //); // Select only the necessary fields from UserProfile

  return users;
};

const getUserById = async (userId: string): Promise<TUserProfile | null> => {
  const user = await UserProfile.findOne({ user: new Types.ObjectId(userId) })
    .populate("user", "name email")
    .populate({
      path: "following.userProfile",
      select: "user verified profilePicture",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate({
      path: "followers.userProfile",
      select: "user verified profilePicture",
      populate: {
        path: "user",
        select: "name email",
      },
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

export const UserService = {
  getUsers,
  getUserById,
  updateUserProfile,
  updateUserFollowing,
};
