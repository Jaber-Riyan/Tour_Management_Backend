import { NextFunction, Request, Response } from "express"
import { envVars } from "../config/env"
import httpStatus from "http-status-codes"
import AppError from "../errorHelpers/AppError"

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    let statusCode = httpStatus.INTERNAL_SERVER_ERROR
    let message = `Something went wrong!!`

    if (err instanceof AppError) {
        statusCode = err.statusCode
        message = err.message
    }
    else if (err instanceof Error) {
        statusCode = 500
        message = err.message
    }

    res.status(statusCode).json({
        success: false,
        message,
        err,
        stack: envVars.NODE_ENV === "development" ? err.stack : null
    })
}