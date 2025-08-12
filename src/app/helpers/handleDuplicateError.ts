import { TGenericErrorResponse } from "../interfaces/error.type"
import httpStatus from "http-status-codes"

export const handleDuplicateError = (err: any): TGenericErrorResponse => {
        const matchedArray = err.message.match(/"([^"]*)"/)

        return {
            statusCode: httpStatus.BAD_REQUEST,
            message: `${matchedArray[1]} already exists!!`
        }
    }