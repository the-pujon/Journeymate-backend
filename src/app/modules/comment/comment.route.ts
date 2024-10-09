import express from "express";
import { CommentController } from "./comment.controller";
import validateRequest from "../../middlewares/validateRequest";
import { createCommentValidation } from "./comment.validation";
import { authorization } from "../../middlewares/authorization";

const router = express.Router();

router.post(
  "/create",
  authorization("user"),
  validateRequest(createCommentValidation),
  CommentController.createComment,
);

export const CommentRoutes = router;
