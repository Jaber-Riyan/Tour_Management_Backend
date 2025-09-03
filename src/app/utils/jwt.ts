import jwt, { JwtPayload, SignOptions } from "jsonwebtoken"
import { envVars } from "../config/env"
import AppError from "../errorHelpers/AppError"

export const generateJwtToken = (payload: JwtPayload, secret: jwt.Secret | jwt.PrivateKey, expiresIn: string = envVars.JWT_ACCESS_EXPIRES) => {
    const accessToken = jwt.sign(payload, secret, {
        expiresIn,
        algorithm: "HS512"
    } as SignOptions)

    return accessToken
}

export const verifyToken = (token: string, secret: string): JwtPayload => {
    try {
        return jwt.verify(token, secret) as JwtPayload;
    } catch (error: any) {
        console.log("JWT ERROR:", error.name, error.message);

        if (error.name === "TokenExpiredError") {
            throw new AppError(401, "Token expired. Please login again.");
        }
        if (error.name === "JsonWebTokenError") {
            throw new AppError(401, "Invalid token. Please login again.");
        }
        throw new AppError(401, "Unauthorized access");
    }
};
