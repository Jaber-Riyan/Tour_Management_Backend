import { envVars } from "../../config/env"
import AppError from "../../errorHelpers/AppError"
import { generateJwtToken } from "../../utils/jwt"
import { IUser } from "../user/user.interface"
import { User } from "../user/user.model"
import bcryptjs from "bcryptjs"
import httpStatus from "http-status-codes"

const credentialsLogin = async (payload: Partial<IUser>) => {
    const { email, password: payloadPassword } = payload

    const isUserExist = await User.findOne({ email })

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not Exist")
    }

    const isPasswordMatched = await bcryptjs.compare(payloadPassword!, isUserExist.password!)

    if (!isPasswordMatched) {
        throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password")
    }

    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role,
    }

    const accessToken = generateJwtToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES)

    return {
        accessToken
    }
}

export const AuthServices = {
    credentialsLogin
}