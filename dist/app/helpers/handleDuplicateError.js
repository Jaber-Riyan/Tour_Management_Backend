"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDuplicateError = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const handleDuplicateError = (err) => {
    const matchedArray = err.message.match(/"([^"]*)"/);
    return {
        statusCode: http_status_codes_1.default.BAD_REQUEST,
        message: `${matchedArray[1]} already exists!!`
    };
};
exports.handleDuplicateError = handleDuplicateError;
