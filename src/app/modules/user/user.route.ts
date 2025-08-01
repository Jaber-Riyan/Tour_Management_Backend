import { NextFunction, Request, Response, Router } from "express";
import { UserControllers } from "./user.controller";
import { createUserZodSchema } from "./user.validation";
import { validateSchema } from "../../middlewares/validateRequest";
import jwt, { JwtPayload } from "jsonwebtoken"
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes"
import { Role } from "./user.interface";

const router = Router()

router.post("/register", validateSchema(createUserZodSchema), UserControllers.createUser)
router.get("/all-users", (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.headers.authorization

        if (!accessToken) {
            throw new AppError(httpStatus.NOT_FOUND, "Access Token Not Received Yet!")
        }

        const verifiedToken = jwt.verify(accessToken, "secret")

        console.log(verifiedToken);

        if (!verifiedToken) {
            throw new AppError(httpStatus.UNAUTHORIZED, `You are not authorized ${verifiedToken}`)
        }

        if ((verifiedToken as JwtPayload).role !== Role.ADMIN || Role.SUPER_ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not permitted to view this route data!")
        }

        console.log(verifiedToken);

        next()
    }
    catch (error: any) {
        next(error)
    }

}, UserControllers.getAllUsers)

export const UserRoutes = router