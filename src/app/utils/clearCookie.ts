import { Response } from "express";

export const clearCookie = (res: Response, tokenName: "accessToken" | "refreshToken") => {
    res.clearCookie(tokenName, {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })
}