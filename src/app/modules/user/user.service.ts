import UserProfile from "./user.model";
import { TUserProfile } from "./user.interface";

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

export const UserService = {
  getUsers,
};
