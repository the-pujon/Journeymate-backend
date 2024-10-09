import { FilterQuery } from "mongoose";
import UserProfile from "./user.model";
import { TUserProfile } from "./user.interface";

// ... existing code ...

const getUsers = async (searchQuery?: string): Promise<TUserProfile[]> => {
  const filter: FilterQuery<TUserProfile> = {};

  if (searchQuery) {
    filter["$or"] = [
      { "user.name": { $regex: searchQuery, $options: "i" } },
      //  { 'user.username': { $regex: searchQuery, $options: 'i' } },
    ];
  }

  const users = await UserProfile.find(filter)
    .populate({
      path: "user",
      select: "name username email",
    })
    .populate({
      path: "followers",
      populate: {
        path: "user",
        select: "name username email",
      },
    })
    .populate({
      path: "following",
      populate: {
        path: "user",
        select: "name username email",
      },
    })
    .populate({
      path: "posts",
      select: "title content createdAt",
      populate: {
        path: "author",
        select: "name username",
      },
    });

  return users;
};

export const UserService = {
  // ... existing methods ...
  getUsers,
};
