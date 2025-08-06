import passport from "passport";
import { Strategy as GoogleStrategy, Profile as GoogleStrategyProfile, VerifyCallback as GoogleStrategyVerifyCallback } from "passport-google-oauth20";
import { envVars } from "./env";
import AppError from "../errorHelpers/AppError";
import httpStatus from "http-status-codes"
import { User } from "../modules/user/user.model";
import { Role } from "../modules/user/user.interface";


passport.use(
    new GoogleStrategy(
        {
            clientID: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,
            callbackURL: envVars.GOOGLE_CALLBACK_URL
        },
        async (accessToken: string, refreshToken: string, profile: GoogleStrategyProfile, done: GoogleStrategyVerifyCallback) => {
            try {
                const email = profile.emails?.[0].value

                if (!email) {
                    return done(null, false, { message: "No email Found" })
                }

                let user = await User.findOne({ email })

                if (!user) {
                    user = await User.create({
                        email,
                        name: profile.displayName,
                        picture: profile.photos?.[0].value,
                        role: Role.USER,
                        isVerified: true,
                        auths: [
                            {
                                provider: "google",
                                providerId: profile.id
                            }
                        ]
                    })
                }

                return done(null, user)

            } catch (error: any) {
                console.log("Google Strategy Error", error);
                return done(error)
            }
        }
    )
)

// localhost:5173 -> localhost:5000/api/v1/auth/google -> Passport -> Google OAuth Consent -> Gmail Login -> Successful -> Callback URL : localhost:5000/api/v1/auth/google/callback