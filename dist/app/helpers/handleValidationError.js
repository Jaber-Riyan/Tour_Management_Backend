"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationError = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const handleValidationError = (err) => {
    const errorsSources = [];
    const errors = Object.values(err.errors);
    errors.forEach((errorObj) => errorsSources.push({
        path: errorObj.path,
        message: errorObj.message
    }));
    return {
        statusCode: http_status_codes_1.default.INTERNAL_SERVER_ERROR,
        message: "Validation Error",
        errorsSources
    };
};
exports.handleValidationError = handleValidationError;
