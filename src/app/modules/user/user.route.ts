import { NextFunction, Request, Response, Router } from "express";
import { UserControllers } from "./user.controller";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import jwt, { JwtPayload } from "jsonwebtoken"
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes"
import { Role } from "./user.interface";
import { verifyToken } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router()

router.post("/register", validateRequest(createUserZodSchema), UserControllers.createUser)

router.get("/all-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllUsers)

router.patch("/:id", validateRequest(updateUserZodSchema), checkAuth(...Object.values(Role)), UserControllers.updateUser)

export const UserRoutes = router