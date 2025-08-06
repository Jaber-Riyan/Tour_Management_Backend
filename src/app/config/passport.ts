import passport from "passport";
import { Strategy as GoogleStrategy, Profile as GoogleStrategyProfile, VerifyCallback as GoogleStrategyVerifyCallback } from "passport-google-oauth20";
import { envVars } from "./env";


passport.use(
    new GoogleStrategy(
        {
            clientID: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,
            callbackURL: envVars.GOOGLE_CALLBACK_URL
        },
        async (accessToken: string, refreshToken: string, profile: GoogleStrategyProfile, done: GoogleStrategyVerifyCallback) =>  {

        }
    )
)