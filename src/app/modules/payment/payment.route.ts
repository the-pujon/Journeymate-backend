import express from "express";
import { PaymentController } from "./payment.controller";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentValidation } from "./payment.validation";
import { authorization } from "../../middlewares/authorization";

const router = express.Router();

router.post(
  "/create-payment",
  authorization("user", "admin"), // Add authentication middleware
  validateRequest(PaymentValidation.createPaymentZodSchema),
  PaymentController.createPayment,
);

router.get("/", PaymentController.getPayments);

router.delete("/:id", authorization("admin"), PaymentController.deletePayment);

export const PaymentRoutes = router;
