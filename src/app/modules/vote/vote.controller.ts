import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { VoteService } from "./vote.service";

const getVote = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { postId } = req.params;

  const result = await VoteService.getVote(userId, postId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Vote retrieved successfully",
    data: result,
  });
});

export const VoteController = {
  getVote,
};
