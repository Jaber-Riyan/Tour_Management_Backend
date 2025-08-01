import jwt, { JwtPayload, SignOptions } from "jsonwebtoken"
import { envVars } from "../config/env"

export const generateJwtToken = (payload: JwtPayload, secret: jwt.Secret | jwt.PrivateKey, expiresIn: string = envVars.JWT_ACCESS_EXPIRES) => {
    const accessToken = jwt.sign(payload, secret, {
        expiresIn,
        algorithm: "HS512"
    } as SignOptions)

    return accessToken
}

export const verifyToken = (token: string, secret: string) => {

    const verifiedToken = jwt.verify(token, secret)

    return verifiedToken
}