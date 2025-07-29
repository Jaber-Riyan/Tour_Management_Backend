/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes"
import { UserServices } from "./user.service";
import AppError from "../../errorHelpers/AppError";

const createUser = async (req: Request, res: Response, next:NextFunction) => {
    try {
        // throw new Error("fake error")
        const user = await UserServices.createUser(req.body)
        res.status(httpStatus.CREATED).json({
            success: true,
            message: "Account Create Successfully",
            user
        })
    }
    catch (error: any) {
        console.log(error);
        next(error)
    }
}

export const UserControllers = {
    createUser
}