"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateJwtToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const generateJwtToken = (payload, secret, expiresIn = env_1.envVars.JWT_ACCESS_EXPIRES) => {
    const accessToken = jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn,
        algorithm: "HS512"
    });
    return accessToken;
};
exports.generateJwtToken = generateJwtToken;
const verifyToken = (token, secret) => {
    try {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        console.log("JWT ERROR:", error.name, error.message);
        if (error.name === "TokenExpiredError") {
            throw new AppError_1.default(401, "Token expired. Please get new one");
        }
        if (error.name === "JsonWebTokenError") {
            throw new AppError_1.default(401, "Invalid token. Please get new one");
        }
        throw new AppError_1.default(401, "Unauthorized access");
    }
};
exports.verifyToken = verifyToken;
