"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteRoutes = void 0;
const express_1 = __importDefault(require("express"));
const vote_controller_1 = require("./vote.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const vote_validation_1 = require("./vote.validation");
const authorization_1 = require("../../middlewares/authorization");
const router = express_1.default.Router();
router.get("/:postId", (0, authorization_1.authorization)("user", "admin"), (0, validateRequest_1.default)(vote_validation_1.getVoteValidation), vote_controller_1.VoteController.getVote);
exports.VoteRoutes = router;
