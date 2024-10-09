import express from "express";
import { PostController } from "./post.controller";
import validateRequest from "../../middlewares/validateRequest";
import {
  createPostValidation,
  getPostsValidation,
  getPostsByUserIdValidation,
  getPostByIdValidation,
  updatePostValidation,
  deletePostValidation,
} from "./post.validation";
import { authorization } from "../../middlewares/authorization";

const router = express.Router();

router.post(
  "/create",
  authorization("user"),
  validateRequest(createPostValidation),
  PostController.createPost,
);

router.get("/", validateRequest(getPostsValidation), PostController.getPosts);

router.get(
  "/user/:userId",
  validateRequest(getPostsByUserIdValidation),
  PostController.getPostsByUserId,
);

router.get(
  "/:id",
  validateRequest(getPostByIdValidation),
  PostController.getPostById,
);

router.patch(
  "/:id",
  authorization("user"),
  validateRequest(updatePostValidation),
  PostController.updatePost,
);

router.delete(
  "/:id",
  authorization("admin", "user"),
  validateRequest(deletePostValidation),
  PostController.deletePost,
);

export const PostRoutes = router;
