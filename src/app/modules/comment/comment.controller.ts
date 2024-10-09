import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CommentService } from "./comment.service";

const createComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { content, post } = req.body;

  const result = await CommentService.createComment(userId, content, post);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Comment created successfully",
    data: result,
  });
});

export const CommentController = {
  createComment,
};
