import { NextFunction, Request, Response, Router } from "express";
import { UserControllers } from "./user.controller";
import { createUserZodSchema } from "./user.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import jwt, { JwtPayload } from "jsonwebtoken"
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes"
import { Role } from "./user.interface";
import { verifyToken } from "../../utility/jwt";
import { envVars } from "../../config/env";

const router = Router()

const checkAuth = (...authRoles: string[]) => (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.headers.authorization

        if (!accessToken) {
            throw new AppError(httpStatus.NOT_FOUND, "Access Token Not Received Yet!")
        }

        const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET)

        if ((verifiedToken as JwtPayload).role !== Role.ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not permitted to view this route data!")
        }

        next()
    }
    catch (error: any) {
        next(error)
    }

}

router.post("/register", validateRequest(createUserZodSchema), UserControllers.createUser)

router.get("/all-users", checkAuth("ADMIN", "SUPER_ADMIN"), UserControllers.getAllUsers)

export const UserRoutes = router