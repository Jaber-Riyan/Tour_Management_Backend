import { Server } from 'http'
import mongoose from 'mongoose'
import { app } from './app'
import { envVars } from './app/config/env'
import { seedSuperAdmin } from './app/utils/seedSuperAdmin'
import { connectRedis } from './app/config/redis.config'


let server: Server

const startSever = async () => {
    try {
        // await mongoose.connect(`${envVars.DB_URL}`)
        await mongoose.connect(envVars.DB_URL as string)

        console.log("Server Working Finely 🎉");

        server = app.listen(envVars.PORT, () => {
            console.log(`Server is listening to port ${envVars.PORT}`);
        })
    } catch (error) {
        console.log(error);
    }
}

(async () => {
    connectRedis()
    startSever()
    seedSuperAdmin()
})()

process.on("SIGTERM", () => {
    console.log("Signal Termination received....Server shutting down");

    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }

    process.exit(1)
})

process.on("unhandledRejection", (err) => {
    console.log("Unhandled Rejection detected....Server shutting down", err);

    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }

    process.exit(1)
})

// Promise.reject(new Error("i forgot to handle this error"))

process.on("uncaughtException", (err) => {
    console.log("Unhandled Exception detected....Server shutting down", err);

    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }

    process.exit(1)
})

// throw new Error("i also forgot to handle this error too")





