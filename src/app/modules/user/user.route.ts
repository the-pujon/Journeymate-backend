import express from "express";
import { UserController } from "./user.controller";
//import validateRequest from "../../middlewares/validateRequest";
import { updateUserProfileValidation } from "./user.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = express.Router();

router.get("/", UserController.getUsers);
router.get("/:id", UserController.getUserById);
router.patch(
  "/:id",
  validateRequest(updateUserProfileValidation),
  UserController.updateUserProfile,
);

export const UserRoutes = router;
