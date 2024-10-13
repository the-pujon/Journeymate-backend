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
exports.sendRecoveryEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: config_1.default.email_user,
        pass: config_1.default.email_pass,
    },
});
const sendEmail = (to, subject, text, html) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield transporter.sendMail({
            from: config_1.default.email_user,
            to,
            subject,
            text,
            html,
        });
        console.log("Email sent successfully");
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
});
exports.sendEmail = sendEmail;
const sendRecoveryEmail = (email, recoveryCode) => __awaiter(void 0, void 0, void 0, function* () {
    const subject = "Password Recovery Code";
    const text = `Your password recovery code is: ${recoveryCode}`;
    const html = `<p>Your password recovery code is: <strong>${recoveryCode}</strong></p>`;
    yield (0, exports.sendEmail)(email, subject, text, html);
});
exports.sendRecoveryEmail = sendRecoveryEmail;
