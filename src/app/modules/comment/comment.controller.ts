import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CommentService } from "./comment.service";

const createComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { content, post, parentComment } = req.body;

  const result = await CommentService.createComment(
    userId,
    content,
    post,
    parentComment,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Comment created successfully",
    data: result,
  });
});

const getCommentsByPostId = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;

  const result = await CommentService.getCommentsByPostId(postId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comments retrieved successfully",
    data: result,
  });
});

const editComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { commentId } = req.params;
  const { content } = req.body;

  const result = await CommentService.editComment(userId, commentId, content);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment updated successfully",
    data: result,
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { commentId } = req.params;

  await CommentService.deleteComment(userId, commentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment deleted successfully",
    data: null,
  });
});

const voteComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { commentId } = req.params;
  const { voteType } = req.body;

  const result = await CommentService.voteComment(userId, commentId, voteType);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment voted successfully",
    data: result,
  });
});

const getComment = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentService.getCommentService();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comments retrieved successfully",
    data: result,
  });
});

export const CommentController = {
  createComment,
  getCommentsByPostId,
  editComment,
  deleteComment,
  voteComment,
  getComment,
};
