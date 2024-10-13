"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_validation_1 = require("./user.validation");
const authorization_1 = require("../../middlewares/authorization");
const router = express_1.default.Router();
router.get("/", (0, authorization_1.authorization)("admin", "user"), user_controller_1.UserController.getUsers);
router.get("/:id", (0, authorization_1.authorization)("admin", "user"), user_controller_1.UserController.getUserById);
router.patch("/:id", (0, validateRequest_1.default)(user_validation_1.updateUserProfileValidation), (0, authorization_1.authorization)("admin", "user"), user_controller_1.UserController.updateUserProfile);
router.post("/follow", (0, authorization_1.authorization)("admin", "user"), (0, validateRequest_1.default)(user_validation_1.updateUserFollowingValidation), user_controller_1.UserController.updateUserFollowing);
router.post("/unfollow", (0, authorization_1.authorization)("admin", "user"), (0, validateRequest_1.default)(user_validation_1.unfollowUserValidation), user_controller_1.UserController.unfollowUser);
router.post("/request-verification", (0, authorization_1.authorization)("user"), (0, validateRequest_1.default)(user_validation_1.verificationRequestValidation), user_controller_1.UserController.requestVerification);
exports.UserRoutes = router;
