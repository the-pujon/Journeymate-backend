import express from "express";
import { CommentController } from "./comment.controller";
import validateRequest from "../../middlewares/validateRequest";
import {
  createCommentValidation,
  getCommentsByPostIdValidation,
  editCommentValidation,
  deleteCommentValidation,
  voteCommentValidation,
} from "./comment.validation";
import { authorization } from "../../middlewares/authorization";

const router = express.Router();

router.post(
  "/create",
  authorization("user", "admin"),
  validateRequest(createCommentValidation),
  CommentController.createComment,
);

router.get(
  "/post/:postId",
  authorization("user", "admin"),
  validateRequest(getCommentsByPostIdValidation),
  CommentController.getCommentsByPostId,
);

router.patch(
  "/:commentId",
  authorization("user", "admin"),
  validateRequest(editCommentValidation),
  CommentController.editComment,
);

router.delete(
  "/:commentId",
  authorization("user", "admin"),
  validateRequest(deleteCommentValidation),
  CommentController.deleteComment,
);

router.post(
  "/:commentId/vote",
  authorization("user", "admin"),
  validateRequest(voteCommentValidation),
  CommentController.voteComment,
);

router.get("/", authorization("admin", "user"), CommentController.getComment);

export const CommentRoutes = router;
