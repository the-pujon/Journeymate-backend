import express from "express";
import { VoteController } from "./vote.controller";
import validateRequest from "../../middlewares/validateRequest";
import { getVoteValidation } from "./vote.validation";
import { authorization } from "../../middlewares/authorization";

const router = express.Router();

router.get(
  "/:postId",
  authorization("user"),
  validateRequest(getVoteValidation),
  VoteController.getVote,
);

export const VoteRoutes = router;
