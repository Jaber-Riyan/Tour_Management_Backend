"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionId = void 0;
const getTransactionId = () => {
    // return `tran_${Date.now()}_${uuidv4()}`
    return `tran_${Date.now()}`;
};
exports.getTransactionId = getTransactionId;
