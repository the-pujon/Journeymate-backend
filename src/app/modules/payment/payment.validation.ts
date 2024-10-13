import { z } from "zod";

const createPaymentZodSchema = z.object({
  body: z.object({
    user: z.string().optional(),
    amount: z.number().positive(),
    status: z.enum(["pending", "success", "failed"]),
    transactionId: z.string(),
  }),
});

export const PaymentValidation = {
  createPaymentZodSchema,
};
