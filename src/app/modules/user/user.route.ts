import express from "express";
import { UserController } from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import {
  updateUserProfileValidation,
  updateUserFollowingValidation,
  unfollowUserValidation,
  verificationRequestValidation,
} from "./user.validation";
import { authorization } from "../../middlewares/authorization";

const router = express.Router();

router.get("/", authorization("admin", "user"), UserController.getUsers);
router.get("/:id", authorization("admin", "user"), UserController.getUserById);
router.patch(
  "/:id",
  validateRequest(updateUserProfileValidation),
  authorization("admin", "user"),
  UserController.updateUserProfile,
);

router.post(
  "/follow",
  authorization("admin", "user"),
  validateRequest(updateUserFollowingValidation),
  UserController.updateUserFollowing,
);

router.post(
  "/unfollow",
  authorization("admin", "user"),
  validateRequest(unfollowUserValidation),
  UserController.unfollowUser,
);

router.post(
  "/request-verification",
  authorization("user"),
  validateRequest(verificationRequestValidation),
  UserController.requestVerification,
);

export const UserRoutes = router;
