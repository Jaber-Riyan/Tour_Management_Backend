import { NextFunction, Request, Response } from "express"
import AppError from "../errorHelpers/AppError"
import httpStatus from "http-status-codes"
import { envVars } from "../config/env"
import { verifyToken } from "../utils/jwt"
import { JwtPayload } from "jsonwebtoken"

export const checkAuth = (...authRoles: string[]) => (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.headers.authorization

        if (!accessToken) {
            throw new AppError(httpStatus.NOT_FOUND, "Access Token Not Received Yet!")
        }

        const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload

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