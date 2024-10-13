"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const auth_model_1 = require("./auth.model");
const auth_utils_1 = require("./auth.utils");
const config_1 = __importDefault(require("../../config"));
const user_model_1 = __importDefault(require("../user/user.model"));
const email_utils_1 = require("../../utils/email.utils");
//sign up user
const signupUserIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield auth_model_1.AuthModel.isUserExist(payload.email);
    if (existingUser) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "User already exists.");
    }
    const result = yield auth_model_1.AuthModel.create(payload);
    // Create a user profile after successful user creation
    yield user_model_1.default.create({
        user: result._id,
    });
    return (0, auth_utils_1.omitPassword)(result);
});
//login user
const loginUserService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield auth_model_1.AuthModel.isUserExist(payload.email);
    if (!existingUser) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid Email");
    }
    const correctPassword = yield auth_model_1.AuthModel.isPasswordMatch(payload.password, existingUser.password);
    if (!correctPassword) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid Password");
    }
    const jwtPayload = {
        _id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
    };
    const token = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, "5h");
    const loggedUserWithoutPassword = (0, auth_utils_1.omitPassword)(existingUser);
    return { token, user: loggedUserWithoutPassword };
});
const requestPasswordRecovery = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield auth_model_1.AuthModel.isUserExist(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const recoveryCode = (0, auth_utils_1.generateRecoveryCode)();
    const recoveryCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    yield auth_model_1.AuthModel.findByIdAndUpdate(user._id, {
        recoveryCode,
        recoveryCodeExpires,
    });
    yield (0, email_utils_1.sendRecoveryEmail)(email, recoveryCode);
    return { message: "Recovery code sent to your email" };
});
const verifyRecoveryCode = (email, code) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield auth_model_1.AuthModel.findOne({ email, recoveryCode: code }).select("+recoveryCode +recoveryCodeExpires");
    if (!user ||
        !user.recoveryCodeExpires ||
        user.recoveryCodeExpires < new Date()) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid or expired recovery code");
    }
    return { message: "Recovery code verified" };
});
const resetPassword = (email, code, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield auth_model_1.AuthModel.findOne({ email, recoveryCode: code }).select("+recoveryCode +recoveryCodeExpires");
    if (!user ||
        !user.recoveryCodeExpires ||
        user.recoveryCodeExpires < new Date()) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid or expired recovery code");
    }
    user.password = newPassword;
    user.recoveryCode = undefined;
    user.recoveryCodeExpires = undefined;
    yield user.save();
    return { message: "Password reset successfully" };
});
const changePassword = (userId, currentPassword, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield auth_model_1.AuthModel.findById(userId).select("+password");
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const isPasswordMatch = yield auth_model_1.AuthModel.isPasswordMatch(currentPassword, user.password);
    if (!isPasswordMatch) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Current password is incorrect");
    }
    user.password = newPassword;
    yield user.save();
    return { message: "Password changed successfully" };
});
exports.UserService = {
    signupUserIntoDB,
    loginUserService,
    requestPasswordRecovery,
    verifyRecoveryCode,
    resetPassword,
    changePassword,
};
