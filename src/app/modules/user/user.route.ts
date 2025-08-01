import { Router } from "express";
import { UserControllers } from "./user.controller";
import { createUserZodSchema } from "./user.validation";
import { validateSchema } from "../../middlewares/validateRequest";

const router = Router()

router.post("/register", validateSchema(createUserZodSchema), UserControllers.createUser)
router.get("/", UserControllers.getAllUsers)

export const UserRoutes = router