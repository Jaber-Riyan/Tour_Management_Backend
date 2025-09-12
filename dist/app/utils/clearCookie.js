"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCookie = void 0;
const clearCookie = (res, tokenName) => {
    res.clearCookie(tokenName, {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });
};
exports.clearCookie = clearCookie;
