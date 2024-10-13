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
  upvotePostValidation,
  downvotePostValidation,
} from "./post.validation";
import { authorization } from "../../middlewares/authorization";

const router = express.Router();

router.post(
  "/create",
  authorization("user", "admin"),
  validateRequest(createPostValidation),
  PostController.createPost,
);

router.get(
  "/",
  authorization("user", "admin"),
  validateRequest(getPostsValidation),
  PostController.getPosts,
);

router.get(
  "/user/:userId",
  authorization("user", "admin"),
  validateRequest(getPostsByUserIdValidation),
  PostController.getPostsByUserId,
);

router.get(
  "/:id",
  authorization("user", "admin"),
  validateRequest(getPostByIdValidation),
  PostController.getPostById,
);

router.patch(
  "/:id",
  authorization("user", "admin"),
  validateRequest(updatePostValidation),
  PostController.updatePost,
);

router.delete(
  "/:id",
  authorization("admin", "user"),
  validateRequest(deletePostValidation),
  PostController.deletePost,
);

router.post(
  "/:id/upvote",
  authorization("user", "admin"),
  validateRequest(upvotePostValidation),
  PostController.upvotePost,
);

router.post(
  "/:id/downvote",
  authorization("user", "admin"),
  validateRequest(downvotePostValidation),
  PostController.downvotePost,
);

router.get("/allPosts/all", authorization("admin"), PostController.getAllPosts);

export const PostRoutes = router;
