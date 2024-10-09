import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserService } from "./user.service";

const getUsers = catchAsync(async (req: Request, res: Response) => {
  const { search } = req.query;
  const result = await UserService.getUsers(search as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});

export const UserController = {
  getUsers,
};
