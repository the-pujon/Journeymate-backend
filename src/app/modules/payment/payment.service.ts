import { Types } from "mongoose";
import Payment from "./payment.model";
import { TPayment } from "./payment.interface";
import UserProfile from "../user/user.model";

const createPayment = async (
  userId: string,
  paymentData: Omit<TPayment, "user">,
): Promise<TPayment> => {
  const session = await Payment.startSession();
  let result;

  try {
    session.startTransaction();

    // Create the payment
    result = await Payment.create([{ ...paymentData, user: userId }], {
      session,
    });

    // Update user profile to set verified as true
    await UserProfile.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      {
        $set: {
          verified: true,
          verificationRequestDate: new Date(),
        },
      },
      { session },
    );

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }

  return result[0];
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
