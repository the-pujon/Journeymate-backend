import jwt from "jsonwebtoken";
import { TUser } from "./auth.interface";
import crypto from "crypto";

export const createToken = (
  jwtPayload: {
    email: string;
    role: string;
  },
  secret: string,
  expiresIn: string,
) => {
  return jwt.sign(jwtPayload, secret, { expiresIn });
};

export const omitPassword = (user: TUser) => {
  const plainUser = JSON.parse(JSON.stringify(user));
  delete plainUser.password;
  delete plainUser._v;

  return plainUser;
};

//generate recovery code
export const generateRecoveryCode = () => {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};
