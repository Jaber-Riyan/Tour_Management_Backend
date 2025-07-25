import express, { Application, Request, Response } from 'express'


export const app: Application = express()


app.get("/", async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Tour Management System Backend"
    })
})