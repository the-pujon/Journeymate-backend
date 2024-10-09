import { Schema, model } from "mongoose";
import { TPayment } from "./payment.interface";

const paymentSchema = new Schema<TPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Payment = model<TPayment>("Payment", paymentSchema);

export default Payment;
