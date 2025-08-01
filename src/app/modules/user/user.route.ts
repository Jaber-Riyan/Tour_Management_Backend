import { NextFunction, Request, Response, Router } from "express";
import { UserControllers } from "./user.controller";
import { ZodObject } from "zod";
import { createUserZodSchema } from "./user.validation";
import { validateSchema } from "../../utility/validateSchema";

const router = Router()

router.post("/register", validateSchema(createUserZodSchema), UserControllers.createUser)
router.get("/", UserControllers.getAllUsers)

export const UserRoutes = router