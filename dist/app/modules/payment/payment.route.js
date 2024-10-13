"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("./payment.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const payment_validation_1 = require("./payment.validation");
const authorization_1 = require("../../middlewares/authorization");
const router = express_1.default.Router();
router.post("/create-payment", (0, authorization_1.authorization)("user", "admin"), // Add authentication middleware
(0, validateRequest_1.default)(payment_validation_1.PaymentValidation.createPaymentZodSchema), payment_controller_1.PaymentController.createPayment);
router.get("/", payment_controller_1.PaymentController.getPayments);
router.delete("/:id", (0, authorization_1.authorization)("admin"), payment_controller_1.PaymentController.deletePayment);
exports.PaymentRoutes = router;
