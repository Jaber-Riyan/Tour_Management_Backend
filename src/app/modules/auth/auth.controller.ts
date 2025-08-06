import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import httpStatus from "http-status-codes"
import { AuthServices } from "./auth.service"
import AppError from "../../errorHelpers/AppError"
import { setAuthCookie } from "../../utils/setCookie"
import { clearCookie } from "../../utils/clearCookie"
import { JwtPayload } from "jsonwebtoken"
import { createUserTokens } from "../../utils/userTokes"
import { envVars } from "../../config/env"

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthServices.credentialsLogin(req.body)

    // res.cookie("accessToken", loginInfo.accessToken, {
    //     httpOnly: true,
    //     secure: false,
    // })

    setAuthCookie(res, loginInfo)

    // res.cookie("refreshToken", loginInfo.refreshToken, {
    //     httpOnly: true,
    //     secure: false,
    // })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged In Successfully",
        data: loginInfo
    })
})

const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const refreshToken = req.cookies.refreshToken as string

    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "No Refresh Token Received From Cookies")
    }

    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken)

    // res.cookie("accessToken", tokenInfo.accessToken, {
    //     httpOnly: true,
    //     secure: false,
    // })

    setAuthCookie(res, { accessToken: tokenInfo.accessToken })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "New Access Token Retrieved Successfully",
        data: tokenInfo
    })
})

const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    clearCookie(res, "accessToken")
    clearCookie(res, "refreshToken")

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logout Successfully",
        data: null
    })
})

const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const decodedToken = req.user

    const newPasswordFromBody = req.body.newPassword
    const oldPasswordFromBody = req.body.oldPassword

    await AuthServices.resetPassword(oldPasswordFromBody, newPasswordFromBody, decodedToken as JwtPayload)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password Updated Successfully",
        data: null
    })
})

const googleCallbackControl = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    let redirectTo = req.query.state ? req.query.state as string : ""

    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1)
    }

    const user = req.user

    console.log("User From OAuth", user)

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found!")
    }

    const tokenInfo = createUserTokens(user)

    setAuthCookie(res, tokenInfo)

    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`)
})

export const AuthController = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    resetPassword,
    googleCallbackControl
}