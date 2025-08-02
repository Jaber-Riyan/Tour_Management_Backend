import { JwtPayload } from "jsonwebtoken"
import { envVars } from "../../config/env"
import AppError from "../../errorHelpers/AppError"
import { generateJwtToken, verifyToken } from "../../utils/jwt"
import { createUserTokens } from "../../utils/userTokes"
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
    const verifiedRefreshToken = verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload

    const isUserExist = await User.findOne({ email: verifiedRefreshToken.email })

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not Exist")
    }

    if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
        throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive.toLowerCase()}`)
    }

    if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
    }

    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role,
    }

    const accessToken = generateJwtToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES)

    // delete isUserExist.password
    const { password, ...rest } = isUserExist.toObject()

    return {
        accessToken
    }
}

export const AuthServices = {
    credentialsLogin,
    getNewAccessToken
}