import httpStatus from "http-status-codes"
import mongoose from "mongoose"
import { TErrorSources, TGenericErrorResponse } from "../interfaces/error.type"

export const handleValidationError = (err: mongoose.Error.ValidationError): TGenericErrorResponse => {

    const errorsSources: TErrorSources[] = []

    const errors = Object.values(err.errors)
    errors.forEach((errorObj: any) => errorsSources.push({
        path: errorObj.path,
        message: errorObj.message
    }))

    return {
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Validation Error",
        errorsSources
    }
}