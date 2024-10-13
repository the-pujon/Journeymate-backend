"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const comment_controller_1 = require("./comment.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const comment_validation_1 = require("./comment.validation");
const authorization_1 = require("../../middlewares/authorization");
const router = express_1.default.Router();
router.post("/create", (0, authorization_1.authorization)("user", "admin"), (0, validateRequest_1.default)(comment_validation_1.createCommentValidation), comment_controller_1.CommentController.createComment);
router.get("/post/:postId", (0, authorization_1.authorization)("user", "admin"), (0, validateRequest_1.default)(comment_validation_1.getCommentsByPostIdValidation), comment_controller_1.CommentController.getCommentsByPostId);
router.patch("/:commentId", (0, authorization_1.authorization)("user", "admin"), (0, validateRequest_1.default)(comment_validation_1.editCommentValidation), comment_controller_1.CommentController.editComment);
router.delete("/:commentId", (0, authorization_1.authorization)("user", "admin"), (0, validateRequest_1.default)(comment_validation_1.deleteCommentValidation), comment_controller_1.CommentController.deleteComment);
router.post("/:commentId/vote", (0, authorization_1.authorization)("user", "admin"), (0, validateRequest_1.default)(comment_validation_1.voteCommentValidation), comment_controller_1.CommentController.voteComment);
router.get("/", (0, authorization_1.authorization)("admin", "user"), comment_controller_1.CommentController.getComment);
exports.CommentRoutes = router;
