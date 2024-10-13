"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const paymentSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
const Payment = (0, mongoose_1.model)("Payment", paymentSchema);
exports.default = Payment;
