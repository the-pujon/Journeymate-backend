import { Model } from "mongoose";

type TRole = "admin" | "user";

export interface TUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role?: TRole;
  recoveryCode?: string;
  recoveryCodeExpires?: Date;
}

export interface AuthStaticMethods extends Model<TUser> {
  isUserExist(email: string): Promise<TUser>;
  isPasswordMatch(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}
