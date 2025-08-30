import passport from "passport";
import { Strategy as GoogleStrategy, Profile as GoogleStrategyProfile, VerifyCallback } from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { Role } from "../modules/user/user.interface";
import { Strategy as LocalStrategy } from "passport-local";
import bcryptjs from "bcryptjs"


passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password"
        },
        async (email: string, password: string, done) => {
            try {
                const isUserExist = await User.findOne({ email })

                if (!isUserExist) {
                    return done(null, false, { message: "User does not Exist" })
                }

                // if(!isUserExist){
                //     return done("User does not Exist")
                // }

                const isGoogleAuthenticated = isUserExist.auths.some(providerObjects => providerObjects.provider == "google")

                // if(isGoogleAuthenticated){
                //     return done(null, false, {message:"You have authenticated through google. If you want to login with credentials, then first you login with google and set a password for your gmail, then you can login with email and password"})
                // }

                if (isGoogleAuthenticated && !isUserExist.password) {
                    return done("You have authenticated through google. If you want to login with credentials, then first you login with google and set a password for your gmail, then you can login with email and password")
                }

                const isPasswordMatched = await bcryptjs.compare(password!, isUserExist.password!)

                if (!isPasswordMatched) {
                    return done(null, false, { message: "Incorrect Password" })
                }

                return done(null, isUserExist)

                // const { accessToken, refreshToken } = createUserTokens(isUserExist)
            }
            catch (error) {
                done(error)
            }
        }
    )
)

passport.use(
    new GoogleStrategy(
        {
            clientID: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,
            callbackURL: envVars.GOOGLE_CALLBACK_URL
        },
        async (accessToken: string, refreshToken: string, profile: GoogleStrategyProfile, done: VerifyCallback) => {
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

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
    done(null, user._id)
})

passport.deserializeUser(async (id: string, done: any) => {
    try {
        const user = await User.findById(id)
        done(null, user)
    } catch (error) {
        done(error)
    }
})