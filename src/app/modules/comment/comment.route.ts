import express from "express";
import { CommentController } from "./comment.controller";
import validateRequest from "../../middlewares/validateRequest";
import {
  createCommentValidation,
  getCommentsByPostIdValidation,
  editCommentValidation,
  deleteCommentValidation,
} from "./comment.validation";
import { authorization } from "../../middlewares/authorization";

const router = express.Router();

router.post(
  "/create",
  authorization("user"),
  validateRequest(createCommentValidation),
  CommentController.createComment,
);

router.get(
  "/post/:postId",
  validateRequest(getCommentsByPostIdValidation),
  CommentController.getCommentsByPostId,
);

router.patch(
  "/:commentId",
  authorization("user"),
  validateRequest(editCommentValidation),
  CommentController.editComment,
);

router.delete(
  "/:commentId",
  authorization("user"),
  validateRequest(deleteCommentValidation),
  CommentController.deleteComment,
);

export const CommentRoutes = router;
