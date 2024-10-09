import UserProfile from "./user.model";
import { AuthModel } from "../auth/auth.model"; // Assuming this is where your User model is
import { TUserProfile } from "./user.interface";
import { Types } from "mongoose";

const getUsers = async (searchQuery?: string): Promise<TUserProfile[]> => {
  const aggregationPipeline = [];

  aggregationPipeline.push({
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "userDetails",
    },
  });

  aggregationPipeline.push({ $unwind: "$userDetails" });

  if (searchQuery) {
    aggregationPipeline.push({
      $match: {
        $or: [
          { "userDetails.name": { $regex: searchQuery, $options: "i" } },
          { "userDetails.email": { $regex: searchQuery, $options: "i" } },
        ],
      },
    });
  }

  aggregationPipeline.push({
    $project: {
      _id: 1,
      user: {
        _id: "$userDetails._id",
        name: "$userDetails.name",
        email: "$userDetails.email",
      },
      verified: 1,
      followers: 1,
      following: 1,
      posts: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  });

  const users = await UserProfile.aggregate(aggregationPipeline);

  return users;
};

const getUserById = async (userId: string): Promise<TUserProfile | null> => {
  const user = await UserProfile.findOne({
    user: new Types.ObjectId(userId),
  }).populate({
    path: "user",
    select: "name email",
  });

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

export const UserService = {
  getUsers,
  getUserById,
  updateUserProfile,
};
