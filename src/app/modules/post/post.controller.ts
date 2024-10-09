import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PostService } from "./post.service";

const createPost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const postData = req.body;

  const result = await PostService.createPost(userId, postData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Post created successfully",
    data: result,
  });
});

export const PostController = {
  createPost,
};
