import { NextFunction, Request, Response } from "express"
import AppError from "../errorHelpers/AppError"
import httpStatus from "http-status-codes"
import { envVars } from "../config/env"
import { verifyToken } from "../utils/jwt"
import { JwtPayload } from "jsonwebtoken"
import { User } from "../modules/user/user.model"
import { IsActive } from "../modules/user/user.interface"

export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        // console.log(req.cookies)
        const accessToken = req.headers.authorization || req.cookies.accessToken

        if (!accessToken) {
            throw new AppError(httpStatus.NOT_FOUND, "Access Token Not Received Yet!")
        }

        const verifiedToken = verifyToken(accessToken as string, envVars.JWT_ACCESS_SECRET) as JwtPayload

        // console.log(verifiedToken)

        const isUserExist = await User.findOne({ email: verifiedToken.email })

        // console.log(isUserExist)

        if (!isUserExist) {
            throw new AppError(httpStatus.BAD_REQUEST, "User does not Exist")
        }

        if (!isUserExist.isVerified) {
            throw new AppError(httpStatus.BAD_REQUEST, "User is not Verified!")
        }

        if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
            throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive.toLowerCase()}`)
        }

        if (isUserExist.isDeleted) {
            throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
        }

        if (!authRoles.includes(verifiedToken.role)) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not permitted to view this route data!")
        }

        req.user = verifiedToken

        next()
    }
    catch (error: any) {
        next(error)
    }
}