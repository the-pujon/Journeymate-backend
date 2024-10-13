import { Types } from "mongoose";
import Payment from "./payment.model";
import { TPayment } from "./payment.interface";

const createPayment = async (paymentData: TPayment): Promise<TPayment> => {
  const result = await Payment.create(paymentData);
  return result;
};

const getPayments = async (): Promise<TPayment[]> => {
  const result = await Payment.find().populate("user");
  return result;
};

const deletePayment = async (id: string): Promise<TPayment | null> => {
  const result = await Payment.findByIdAndDelete(id);
  return result;
};

export const PaymentService = {
  createPayment,
  getPayments,
  deletePayment,
};
