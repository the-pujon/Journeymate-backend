import { Types } from "mongoose";
import Payment from "./payment.model";
import { TPayment } from "./payment.interface";
import UserProfile from "../user/user.model";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const createPayment = async (
  userId: string,
  paymentData: Omit<TPayment, "user">,
): Promise<TPayment> => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    const session = await Payment.startSession();
    let result;

    try {
      session.startTransaction();

      // Check if user is already verified
      const userProfile = await UserProfile.findOne({
        user: new Types.ObjectId(userId),
      }).session(session);

      if (userProfile?.verified === true) {
        throw new Error("User is already verified. Payment not allowed.");
      }

      // Check for existing successful payment
      const existingSuccessfulPayment = await Payment.findOne({
        user: userId,
        status: "success",
      }).session(session);

      if (existingSuccessfulPayment) {
        throw new Error(
          "User already has a successful payment. Payment not allowed.",
        );
      }

      // Create new payment
      result = await Payment.create([{ ...paymentData, user: userId }], {
        session,
      });

      if (paymentData.status === "success") {
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
      }

      await session.commitTransaction();
      session.endSession();
      return Array.isArray(result) ? result[0] : result;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      if (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).message.includes("Write conflict") &&
        retries < MAX_RETRIES - 1
      ) {
        retries++;
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        continue;
      }
      throw error;
    }
  }

  throw new Error(
    "Max retries reached. Unable to complete the payment operation.",
  );
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
