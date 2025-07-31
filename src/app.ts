import express, { Application, NextFunction, Request, Response } from 'express'
import morgan from 'morgan'
import cors from "cors"
import { router } from './app/routes'
import { globalErrorHandler } from './app/middlewares/globalErrorHandler'
import { notFound } from './app/middlewares/notFound'

export const app: Application = express()

// Necessary Middleware
app.use(express.json())
app.use(morgan("dev"))
app.use(cors({
    origin: [

    ],
    credentials: true
}))

app.use("/api/v1", router)


app.get("/", async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Tour Management System Backend"
    })
})


app.use(globalErrorHandler)

app.use(notFound)