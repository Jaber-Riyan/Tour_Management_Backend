import { JwtPayload } from "jsonwebtoken"
import { envVars } from "../../config/env"
import AppError from "../../errorHelpers/AppError"
import { generateJwtToken, verifyToken } from "../../utils/jwt"
import { createNewAccessTokenWithRefreshToken, createUserTokens } from "../../utils/userTokes"
import { IsActive, IUser } from "../user/user.interface"
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

    const { accessToken, refreshToken } = createUserTokens(isUserExist)

    // delete isUserExist.password
    const { password, ...rest } = isUserExist.toObject()

    return {
        accessToken,
        refreshToken,
        user: rest
    }
}

const getNewAccessToken = async (refreshToken: string) => {
    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken)

    return {
        accessToken: newAccessToken.accessToken
    }
}

export const AuthServices = {
    credentialsLogin,
    getNewAccessToken
}