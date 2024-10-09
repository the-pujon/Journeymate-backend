import express from "express";
import { PostController } from "./post.controller";
import validateRequest from "../../middlewares/validateRequest";
import { createPostValidation, getPostsValidation } from "./post.validation";
import { authorization } from "../../middlewares/authorization";

const router = express.Router();

router.post(
  "/create",
  authorization("user"),
  validateRequest(createPostValidation),
  PostController.createPost,
);

router.get("/", validateRequest(getPostsValidation), PostController.getPosts);

export const PostRoutes = router;
