import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserService } from "./auth.service";

const signupUser = catchAsync(async (req, res) => {
  console.log(req.body);
  const result = await UserService.signupUserIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User registered successfully",
    data: result,
  });
});

const loginUser = catchAsync(async (req, res) => {
  const result = await UserService.loginUserService(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User login successful",
    token: result.token,
    data: result.user,
  });
});

const requestPasswordRecovery = catchAsync(async (req, res) => {
  const result = await UserService.requestPasswordRecovery(req.body.email);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Recovery code sent",
    data: result,
  });
});

const verifyRecoveryCode = catchAsync(async (req, res) => {
  const result = await UserService.verifyRecoveryCode(
    req.body.email,
    req.body.code,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Recovery code verified",
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const result = await UserService.resetPassword(
    req.body.email,
    req.body.code,
    req.body.newPassword,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Password reset successful",
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const result = await UserService.changePassword(
    req.user._id,
    req.body.currentPassword,
    req.body.newPassword,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Password changed successfully",
    data: result,
  });
});

export const UserController = {
  signupUser,
  loginUser,
  requestPasswordRecovery,
  verifyRecoveryCode,
  resetPassword,
  changePassword,
};
