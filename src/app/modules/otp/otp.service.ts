import crypto from "crypto"
import { User } from "../user/user.model"
import AppError from "../../errorHelpers/AppError"
import { StatusCodes } from "http-status-codes"
import { redisClient } from "../../config/redis.config"
import { sendEmail } from "../../utils/sendEmail"
const OTP_EXPIRATION = 2 * 60

const generateOtp = (length = 6) => {
    // 6 Digit OTP
    const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString()

    // 10 ** 5 => 10 * 10 *10 *10 *10 * 10 => 1000000

    return otp
}

const sendOTP = async (email: string, name: string) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found")
    }

    if (user.isVerified) {
        throw new AppError(StatusCodes.BAD_REQUEST, "You are already verified")
    }

    const otp = generateOtp()

    const redisKey = `otp:${email}`

    await redisClient.set(redisKey, otp, {
        expiration: {
            type: "EX",
            value: OTP_EXPIRATION
        }
    })

    await sendEmail({
        to: email,
        subject: "Your OTP Code",
        templateName: "otp",
        templateData: {
            name,
            otp
        }
    })

};

const verifyOTP = async () => {


};

export const OTPService = {
    sendOTP,
    verifyOTP
}