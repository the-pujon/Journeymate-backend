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

const getPosts = catchAsync(async (req: Request, res: Response) => {
  const { category, author, searchTerm, sortOrder = "desc" } = req.query;

  const result = await PostService.getPosts({
    category: category as string,
    author: author as string,
    searchTerm: searchTerm as string,
    sortOrder: sortOrder as "asc" | "desc",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Posts retrieved successfully",
    data: result,
  });
});

const getPostsByUserId = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { sortOrder = "desc" } = req.query;

  const result = await PostService.getPostsByUserId(
    userId,
    sortOrder as "asc" | "desc",
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User's posts retrieved successfully",
    data: result,
  });
});

const getPostById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await PostService.getPostById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post retrieved successfully",
    data: result,
  });
});

export const PostController = {
  createPost,
  getPosts,
  getPostsByUserId,
  getPostById,
};
