import mongoose from "mongoose"
import { TGenericErrorResponse } from "../interfaces/error.type"
import httpStatus from "http-status-codes"

export const handleCastError = (err: mongoose.Error.CastError): TGenericErrorResponse => {
    return {
        statusCode: httpStatus.BAD_REQUEST,
        message: "Invalid Mongodb ObjectID, Please Provide a valid ID"
    }
}