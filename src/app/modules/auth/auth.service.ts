import { JwtPayload } from "jsonwebtoken"
import { envVars } from "../../config/env"
import AppError from "../../errorHelpers/AppError"
import { createNewAccessTokenWithRefreshToken } from "../../utils/userTokes"
import { User } from "../user/user.model"
import bcryptjs from "bcryptjs"
import httpStatus from "http-status-codes"
import { IAuthProvider } from "../user/user.interface"

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

const changePassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {
    const user = await User.findById(decodedToken.userId)

    const isPasswordMatched = await bcryptjs.compare(oldPassword, user?.password as string)

    if (!isPasswordMatched) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Old Password Does't Match")
    }

    user!.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND))

    user?.save()
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

const setPassword = async (decodedToken: JwtPayload, plainPassword: string) => {

    const user = await User.findById(decodedToken.userId)

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }

    if (user.password && user.auths.some(providerObj => providerObj.provider === "google")) {
        throw new AppError(httpStatus.BAD_REQUEST, "You have already set your password. Now you can change the password from your profile password update")
    }

    const hashedPassword = await bcryptjs.hash(
        plainPassword,
        Number(envVars.BCRYPT_SALT_ROUND)
    )

    const credentialProvider: IAuthProvider = {
        provider: "credentials",
        providerId: user.email
    }

    const auths: IAuthProvider[] = [...user.auths, credentialProvider]

    user.password = hashedPassword

    user.auths = auths

    await user.save()
    
}

export const AuthServices = {
    // credentialsLogin,
    getNewAccessToken,
    changePassword,
    resetPassword,
    setPassword
}