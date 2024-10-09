import { Types } from "mongoose";

export interface TPayment {
  user: Types.ObjectId;
  amount: number;
  status: "pending" | "success" | "failed";
  transactionId: string;
}
