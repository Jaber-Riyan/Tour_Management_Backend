"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserZodSchema = exports.createUserZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("./user.interface");
exports.createUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string()
        .refine(val => typeof val === "string", { message: "Name must be a string value" })
        .min(2, { message: "Name too short. Minimum characters 2 long" })
        .max(50, { message: "Name too long. Maximum 50 characters" }),
    // name: z.object({
    //     firstName: z
    //         .string()
    //         .refine(val => typeof val === "string", { message: "Name must be a string value" })
    //         .min(2, { message: "Name too short. Minimum characters 2 long" })
    //         .max(50, { message: "Name too long. Maximum 50 characters" }),
    //     lastName: z.object({
    //         surName: z
    //             .string()
    //             .refine(val => typeof val === "string", { message: "Name must be a string value" })
    //             .min(2, { message: "Name too short. Minimum characters 2 long" })
    //             .max(50, { message: "Name too long. Maximum 50 characters" }),
    //         nickName: z
    //             .string()
    //             .refine(val => typeof val === "string", { message: "Name must be a string value" })
    //             .min(2, { message: "Name too short. Minimum characters 2 long" })
    //             .max(50, { message: "Name too long. Maximum 50 characters" }),
    //     })
    // }),
    email: zod_1.default
        .string()
        .email({ message: "Invalid mail format, try with correct one" }),
    password: zod_1.default
        .string()
        .refine(val => typeof val === "string", { message: "Name must be a string value" })
        .trim()
    // .min(8, { message: "Password must be at least 8 characters long." })
    // .regex(/^(?=.*[A-Z])/, {
    //     message: "Password must contain at least 1 uppercase letter.",
    // })
    // .regex(/^(?=.*[!@#$%^&*])/, {
    //     message: "Password must contain at least 1 special character.",
    // })
    // .regex(/^(?=.*\d)/, {
    //     message: "Password must contain at least 1 number.",
    // })
    ,
    phone: zod_1.default
        .string()
        .refine(val => typeof val === "string", { message: "Phone Number must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
        message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
        .optional(),
    address: zod_1.default
        .string()
        .refine(val => typeof val === "string", { message: "Address must be string" })
        .max(200, { message: "Address cannot exceed 200 characters." })
        .optional(),
});
exports.updateUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string()
        .refine(val => typeof val === "string", { message: "Name must be string" })
        .min(2, { message: "Name must be at least 2 characters long." })
        .max(50, { message: "Name cannot exceed 50 characters." })
        .optional(),
    phone: zod_1.default
        .string()
        .refine(val => typeof val === "string", { message: "Name must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
        message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
        .optional(),
    role: zod_1.default
        .enum(Object.values(user_interface_1.Role))
        .optional(),
    isActive: zod_1.default
        .enum(Object.values(user_interface_1.IsActive))
        .optional(),
    isDeleted: zod_1.default
        .boolean()
        .refine(val => typeof val === "boolean", { message: "isDeleted must be true or false" })
        .optional(),
    isVerified: zod_1.default
        .boolean()
        .refine(val => typeof val === "boolean", { message: "isDeleted must be true or false" })
        .optional(),
    address: zod_1.default
        .string()
        .refine(val => typeof val === "string", { message: "Address must be string" })
        .max(200, { message: "Address cannot exceed 200 characters." })
        .optional()
});
