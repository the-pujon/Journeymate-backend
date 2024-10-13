"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordValidation = exports.ResetPasswordValidation = exports.VerifyRecoveryCodeValidation = exports.RequestPasswordRecoveryValidation = exports.LoginValidation = exports.SignupValidation = void 0;
const zod_1 = require("zod");
exports.SignupValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string(),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
        role: zod_1.z.enum(["user", "admin"]),
        totalBuy: zod_1.z.number().optional(),
    }),
});
exports.LoginValidation = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
    }),
});
exports.RequestPasswordRecoveryValidation = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
    }),
});
exports.VerifyRecoveryCodeValidation = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        code: zod_1.z.string().length(6),
    }),
});
exports.ResetPasswordValidation = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        code: zod_1.z.string().length(6),
        newPassword: zod_1.z.string().min(8),
    }),
});
exports.ChangePasswordValidation = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string().min(8),
        newPassword: zod_1.z.string().min(8),
    }),
});
