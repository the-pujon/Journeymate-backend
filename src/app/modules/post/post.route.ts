import express from "express";
import { PostController } from "./post.controller";
import validateRequest from "../../middlewares/validateRequest";
import { createPostValidation } from "./post.validation";
import { authorization } from "../../middlewares/authorization";

const router = express.Router();

router.post(
  "/create",
  authorization("user"),
  validateRequest(createPostValidation),
  PostController.createPost,
);

export const PostRoutes = router;
