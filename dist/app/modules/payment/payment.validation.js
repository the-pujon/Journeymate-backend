"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentValidation = void 0;
const zod_1 = require("zod");
const createPaymentZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        user: zod_1.z.string().optional(),
        amount: zod_1.z.number().positive(),
        status: zod_1.z.enum(["pending", "success", "failed"]),
        transactionId: zod_1.z.string(),
    }),
});
exports.PaymentValidation = {
    createPaymentZodSchema,
};
