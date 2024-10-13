import express from "express";
import { PaymentController } from "./payment.controller";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentValidation } from "./payment.validation";

const router = express.Router();

router.post(
  "/create-payment",
  validateRequest(PaymentValidation.createPaymentZodSchema),
  PaymentController.createPayment,
);

router.get("/", PaymentController.getPayments);

router.delete("/:id", PaymentController.deletePayment);

export const PaymentRoutes = router;
