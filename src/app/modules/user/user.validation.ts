import z from "zod";

export const createUserZodSchema = z.object({
    name: z
        .string()
        .refine(val => typeof val === "string", { message: "Name must be a string value" })
        .min(2, { message: "Name too short. Minimum characters 2 long" })
        .max(50, { message: "Name too long. Maximum 50 characters" }),
    email: z
        .string()
        .email({ message: "Invalid mail format, try with correct one" }),
    password: z
        .string()
        .refine(val => typeof val === "string", { message: "Name must be a string value" })
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
    phone: z
        .string()
        .refine(val => typeof val === "string", { message: "Phone Number must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
            message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
        })
        .optional(),
    address: z
        .string()
        .refine(val => typeof val === "string", { message: "Address must be string" })
        .max(200, { message: "Address cannot exceed 200 characters." })
        .optional(),
})