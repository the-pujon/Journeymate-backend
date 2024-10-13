import { Request, Response } from "express";
import { PaymentService } from "./payment.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const userId = req?.user._id; // Assuming the user ID is stored here after authentication
  const result = await PaymentService.createPayment(userId, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Payment created successfully and user verified",
    data: result,
  });
});

const getPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getPayments();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payments retrieved successfully",
    data: result,
  });
});

const deletePayment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PaymentService.deletePayment(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment deleted successfully",
    data: result,
  });
});

export const PaymentController = {
  createPayment,
  getPayments,
  deletePayment,
};
