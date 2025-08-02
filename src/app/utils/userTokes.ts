import { envVars } from "../config/env";
import { IUser } from "../modules/user/user.interface";
import { generateJwtToken } from "./jwt";

export const createUserTokens = (user: Partial<IUser>) => {
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
    }

    const accessToken = generateJwtToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES)

    const refreshToken = generateJwtToken(jwtPayload, envVars.JWT_REFRESH_SECRET, envVars.JWT_REFRESH_EXPIRES)

    return{
        accessToken,
        refreshToken
    }
}