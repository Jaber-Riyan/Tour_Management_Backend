import { NextFunction, Request, Response } from "express"
import { envVars } from "../config/env"
import httpStatus from "http-status-codes"
import AppError from "../errorHelpers/AppError"

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    const errorsSources: any[] = [
        // {
        //     path: "isDeleted",
        //     message: ""
        // }
    ]
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR
    let message = `Something went wrong!!`

    if (err.code === 11000) {
        statusCode = httpStatus.BAD_REQUEST
        const matchedArray = err.message.match(/"([^"]*)"/)
        message = `${matchedArray[1]} already exists!!`
    }

    else if (err.name === "CastError") {
        statusCode = httpStatus.BAD_REQUEST
        message = "Invalid Mongodb ObjectID, Please Provide a valid ID"
    }

    else if (err.name === "ZodError") {
        // console.log("Error ", JSON.parse(err));
        statusCode = httpStatus.BAD_REQUEST
        message = "Zod Error"
        JSON.parse(err?.message).forEach((issue: any) => {
            errorsSources.push({
                path: issue.path.reverse().join(" inside "),
                message: issue.message.split(": ")[1]
            })
        });
    }

    // Mongoose Validation Error
    else if (err.name === "ValidationError") {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR
        const errors = Object.values(err.errors)
        errors.forEach((errorObj: any) => errorsSources.push({
            path: errorObj.path,
            message: errorObj.message
        }))
        // console.log(errorsSources)
        message = "Validation Error"
    }

    else if (err instanceof AppError) {
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
        errorsSources,
        err: JSON.parse(err),
        stack: envVars.NODE_ENV === "development" ? err.stack : null
    })
}