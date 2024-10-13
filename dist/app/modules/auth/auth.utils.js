"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRecoveryCode = exports.omitPassword = exports.createToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const createToken = (jwtPayload, secret, expiresIn) => {
    return jsonwebtoken_1.default.sign(jwtPayload, secret, { expiresIn });
};
exports.createToken = createToken;
const omitPassword = (user) => {
    const plainUser = JSON.parse(JSON.stringify(user));
    delete plainUser.password;
    delete plainUser._v;
    return plainUser;
};
exports.omitPassword = omitPassword;
//generate recovery code
const generateRecoveryCode = () => {
    return crypto_1.default.randomBytes(3).toString("hex").toUpperCase();
};
exports.generateRecoveryCode = generateRecoveryCode;
