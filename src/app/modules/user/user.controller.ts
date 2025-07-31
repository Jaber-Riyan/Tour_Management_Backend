/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes"
import { UserServices } from "./user.service";
import { catchAsync } from "../../utility/catchAsync";


const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body)
    res.status(httpStatus.CREATED).json({
        success: true,
        message: "Account Create Successfully",
        user
    })
})

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users = await UserServices.getAllUsers()

    res.status(httpStatus.OK).json({
        success: true,
        message: "Get All Users",
        users
    })
})

export const UserControllers = {
    createUser,
    getAllUsers
}