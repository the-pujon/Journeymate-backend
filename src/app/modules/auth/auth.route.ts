import { Router } from "express";
import { UserController } from "./auth.controller";
import { authorization } from "../../middlewares/authorization";
//import auth from "../../middlewares/auth";

const router = Router();

router.post("/signup", UserController.signupUser);
router.post("/login", UserController.loginUser);
router.post(
  "/request-password-recovery",
  UserController.requestPasswordRecovery,
);
router.post("/verify-recovery-code", UserController.verifyRecoveryCode);
router.post("/reset-password", UserController.resetPassword);
router.post(
  "/change-password",
  authorization("admin", "user"),
  UserController.changePassword,
);

export const AuthRoutes = router;
