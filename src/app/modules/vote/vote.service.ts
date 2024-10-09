import { Types } from "mongoose";
import Vote from "./vote.model";
import { IVote } from "./vote.interface";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

const getVote = async (
  userId: string,
  postId: string,
): Promise<IVote | null> => {
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(postId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid user ID or post ID");
  }

  const vote = await Vote.findOne({
    user: new Types.ObjectId(userId),
    post: new Types.ObjectId(postId),
  });

  return vote;
};

export const VoteService = {
  getVote,
};
