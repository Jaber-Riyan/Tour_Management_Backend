"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleZodError = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const handleZodError = (err) => {
    const errorsSources = [];
    JSON.parse(err === null || err === void 0 ? void 0 : err.message).forEach((issue) => {
        errorsSources.push({
            // path: issue.path[issue.path.length - 1],
            path: issue.path.length > 1 ? issue.path.reverse().join(" inside ") : issue.path[0],
            message: issue.message.split(": ")[1]
        });
    });
    return {
        statusCode: http_status_codes_1.default.BAD_REQUEST,
        message: "Zod Error",
        errorsSources
    };
};
exports.handleZodError = handleZodError;
