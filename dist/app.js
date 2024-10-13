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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./app/routes"));
const notFoundRouteHandler_1 = __importDefault(require("./app/middlewares/notFoundRouteHandler"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL,
    credentials: true,
}));
app.use("/api", routes_1.default);
app.get("/", (req, res) => {
    res.status(200).json({
        success: "true",
        message: "Welcome to API",
    });
});
app.post("/api/payment/success", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transactionId = `TXN-${Date.now()}`;
    res.redirect(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/success?transactionId=${transactionId}`);
}));
app.post("/api/payment/failure", (req, res) => {
    const transactionId = `TXN-${Date.now()}`;
    res.redirect(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/fail?transactionId=${transactionId}`);
});
app.use(notFoundRouteHandler_1.default);
app.use(globalErrorHandler_1.default);
exports.default = app;
