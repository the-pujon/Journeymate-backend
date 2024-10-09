import { z } from "zod";

export const SignupValidation = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["user", "admin"]),
    totalBuy: z.number().optional(),
  }),
});

export const LoginValidation = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

export const RequestPasswordRecoveryValidation = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const VerifyRecoveryCodeValidation = z.object({
  body: z.object({
    email: z.string().email(),
    code: z.string().length(6),
  }),
});

export const ResetPasswordValidation = z.object({
  body: z.object({
    email: z.string().email(),
    code: z.string().length(6),
    newPassword: z.string().min(8),
  }),
});

export const ChangePasswordValidation = z.object({
  body: z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
  }),
});
