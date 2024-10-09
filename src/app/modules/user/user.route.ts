import express from "express";
import { UserController } from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import {
  updateUserProfileValidation,
  updateUserFollowingValidation,
} from "./user.validation";
import { authorization } from "../../middlewares/authorization";

const router = express.Router();

router.get("/", UserController.getUsers);
router.get("/:id", UserController.getUserById);
router.patch(
  "/:id",
  validateRequest(updateUserProfileValidation),
  UserController.updateUserProfile,
);

router.post(
  "/follow",
  authorization("admin", "user"),
  validateRequest(updateUserFollowingValidation),
  UserController.updateUserFollowing,
);

export const UserRoutes = router;
