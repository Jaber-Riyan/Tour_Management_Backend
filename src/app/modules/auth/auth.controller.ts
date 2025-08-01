import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utility/catchAsync"
import { sendResponse } from "../../utility/sendResponse"
import httpStatus from "http-status-codes"
import { AuthServices } from "./auth.service"

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthServices.credentialsLogin(req.body)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged In Successfully",
        data: loginInfo
    })
})

export const AuthController = {
    credentialsLogin
}