import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TUser } from "./auth.interface";
import { AuthModel } from "./auth.model";
import { JwtPayload } from "jsonwebtoken";
import { createToken, generateRecoveryCode, omitPassword } from "./auth.utils";
import config from "../../config";
import UserProfile from "../user/user.model";
import { sendRecoveryEmail } from "../../utils/email.utils";

//sign up user
const signupUserIntoDB = async (payload: TUser) => {
  const existingUser = await AuthModel.isUserExist(payload.email);

  if (existingUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists.");
  }

  const result = await AuthModel.create(payload);

  // Create a user profile after successful user creation
  await UserProfile.create({
    user: result._id,
  });

  return omitPassword(result);
};

//login user
const loginUserService = async (payload: JwtPayload) => {
  const existingUser = await AuthModel.isUserExist(payload.email);

  if (!existingUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid Email");
  }

  const correctPassword = await AuthModel.isPasswordMatch(
    payload.password,
    existingUser.password,
  );

  if (!correctPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid Password");
  }

  const jwtPayload = {
    email: existingUser.email,
    role: existingUser.role,
  };

  const token = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    "5h",
  );

  const loggedUserWithoutPassword = omitPassword(existingUser);

  return { token, user: loggedUserWithoutPassword };
};

const requestPasswordRecovery = async (email: string) => {
  const user = await AuthModel.isUserExist(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const recoveryCode = generateRecoveryCode();
  const recoveryCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await AuthModel.findByIdAndUpdate(user._id, {
    recoveryCode,
    recoveryCodeExpires,
  });

  await sendRecoveryEmail(email, recoveryCode);

  return { message: "Recovery code sent to your email" };
};

const verifyRecoveryCode = async (email: string, code: string) => {
  const user = await AuthModel.findOne({ email, recoveryCode: code }).select(
    "+recoveryCode +recoveryCodeExpires",
  );

  if (
    !user ||
    !user.recoveryCodeExpires ||
    user.recoveryCodeExpires < new Date()
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid or expired recovery code",
    );
  }

  return { message: "Recovery code verified" };
};

const resetPassword = async (
  email: string,
  code: string,
  newPassword: string,
) => {
  const user = await AuthModel.findOne({ email, recoveryCode: code }).select(
    "+recoveryCode +recoveryCodeExpires",
  );

  if (
    !user ||
    !user.recoveryCodeExpires ||
    user.recoveryCodeExpires < new Date()
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid or expired recovery code",
    );
  }

  user.password = newPassword;
  user.recoveryCode = undefined;
  user.recoveryCodeExpires = undefined;
  await user.save();

  return { message: "Password reset successfully" };
};

const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await AuthModel.findById(userId).select("+password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isPasswordMatch = await AuthModel.isPasswordMatch(
    currentPassword,
    user.password,
  );

  if (!isPasswordMatch) {
    throw new AppError(httpStatus.BAD_REQUEST, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  return { message: "Password changed successfully" };
};

export const UserService = {
  signupUserIntoDB,
  loginUserService,
  requestPasswordRecovery,
  verifyRecoveryCode,
  resetPassword,
  changePassword,
};
