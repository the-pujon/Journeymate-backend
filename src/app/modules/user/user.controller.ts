import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserService } from "./user.service";

const getUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getUsers();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.getUserById(id);

  if (!result) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "User not found",
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

const updateUserProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const updateData = req.body;

  const result = await UserService.updateUserProfile(userId, updateData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile updated successfully",
    data: result,
  });
});

const updateUserFollowing = catchAsync(async (req: Request, res: Response) => {
  const followerId = req.user?._id; // Assuming the user ID is attached to the request by auth middleware
  const { followingId } = req.body;

  const result = await UserService.updateUserFollowing(followerId, followingId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User following updated successfully",
    data: result,
  });
});

const unfollowUser = catchAsync(async (req: Request, res: Response) => {
  const followerId = req.user?._id; // Assuming the user ID is attached to the request by auth middleware
  const { unfollowId } = req.body;

  const result = await UserService.unfollowUser(followerId, unfollowId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User unfollowed successfully",
    data: result,
  });
});

export const UserController = {
  getUsers,
  getUserById,
  updateUserProfile,
  updateUserFollowing,
  unfollowUser,
};
