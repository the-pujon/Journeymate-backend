"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const mongoose_1 = require("mongoose");
const payment_model_1 = __importDefault(require("./payment.model"));
const user_model_1 = __importDefault(require("../user/user.model"));
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const createPayment = (userId, paymentData) => __awaiter(void 0, void 0, void 0, function* () {
    let retries = 0;
    while (retries < MAX_RETRIES) {
        const session = yield payment_model_1.default.startSession();
        let result;
        try {
            session.startTransaction();
            // Check if user is already verified
            const userProfile = yield user_model_1.default.findOne({
                user: new mongoose_1.Types.ObjectId(userId),
            }).session(session);
            if ((userProfile === null || userProfile === void 0 ? void 0 : userProfile.verified) === true) {
                throw new Error("User is already verified. Payment not allowed.");
            }
            // Check for existing successful payment
            const existingSuccessfulPayment = yield payment_model_1.default.findOne({
                user: userId,
                status: "success",
            }).session(session);
            if (existingSuccessfulPayment) {
                throw new Error("User already has a successful payment. Payment not allowed.");
            }
            // Create new payment
            result = yield payment_model_1.default.create([Object.assign(Object.assign({}, paymentData), { user: userId })], {
                session,
            });
            if (paymentData.status === "success") {
                // Update user profile to set verified as true
                yield user_model_1.default.findOneAndUpdate({ user: new mongoose_1.Types.ObjectId(userId) }, {
                    $set: {
                        verified: true,
                        verificationRequestDate: new Date(),
                    },
                }, { session });
            }
            yield session.commitTransaction();
            session.endSession();
            return Array.isArray(result) ? result[0] : result;
        }
        catch (error) {
            yield session.abortTransaction();
            session.endSession();
            if (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            error.message.includes("Write conflict") &&
                retries < MAX_RETRIES - 1) {
                retries++;
                yield new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
                continue;
            }
            throw error;
        }
    }
    throw new Error("Max retries reached. Unable to complete the payment operation.");
});
const getPayments = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payment_model_1.default.find().populate("user");
    return result;
});
const deletePayment = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payment_model_1.default.findByIdAndDelete(id);
    return result;
});
exports.PaymentService = {
    createPayment,
    getPayments,
    deletePayment,
};
