import { JwtPayload } from "jsonwebtoken"
import { envVars } from "../../config/env"
import AppError from "../../errorHelpers/AppError"
import { createNewAccessTokenWithRefreshToken } from "../../utils/userTokes"
import { User } from "../user/user.model"
import bcryptjs from "bcryptjs"
import httpStatus from "http-status-codes"

// const credentialsLogin = async (payload: Partial<IUser>) => {
//     const { email, password: payloadPassword } = payload

//     const isUserExist = await User.findOne({ email })

//     if (!isUserExist) {
//         throw new AppError(httpStatus.BAD_REQUEST, "User does not Exist")
//     }

//     const isPasswordMatched = await bcryptjs.compare(payloadPassword!, isUserExist.password!)

//     if (!isPasswordMatched) {
//         throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password")
//     }

//     const { accessToken, refreshToken } = createUserTokens(isUserExist)

//     // delete isUserExist.password
//     const { password, ...rest } = isUserExist.toObject()

//     return {
//         accessToken,
//         refreshToken,
//         user: rest
//     }
// }

const getNewAccessToken = async (refreshToken: string) => {
    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken)

    return {
        accessToken: newAccessToken.accessToken
    }
}

const resetPassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {
    const user = await User.findById(decodedToken.userId)

    const isPasswordMatched = await bcryptjs.compare(oldPassword, user?.password as string)

    if (!isPasswordMatched) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Old Password Does't Match")
    }

    user!.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND))

    user?.save()
}

export const AuthServices = {
    // credentialsLogin,
    getNewAccessToken,
    resetPassword
}