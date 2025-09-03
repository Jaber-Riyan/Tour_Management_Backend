import passport from "passport";
import { Strategy as GoogleStrategy, Profile as GoogleStrategyProfile, VerifyCallback } from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { IsActive, Role } from "../modules/user/user.interface";
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
                    return done("User does not Exist")
                }

                if (!isUserExist.isVerified) {
                    return done("User is not Verified!")
                }

                if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
                    return done(`User is ${isUserExist.isActive.toLowerCase()}`)
                }

                if (isUserExist.isDeleted) {
                    return done("User is deleted")
                }

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

                let isUserExist = await User.findOne({ email })

                if (isUserExist && !isUserExist.isVerified) {
                    return done(null, false, { message: "User is not verified" })
                }

                if (isUserExist && (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE)) {
                    done(`User is ${isUserExist.isActive}`)
                }

                if (isUserExist && isUserExist.isDeleted) {
                    return done(null, false, { message: "User is deleted" })
                }

                if (isUserExist && isUserExist.auths.some(providerObj => providerObj.provider = "credentials")) {
                    isUserExist.auths = [
                        ...isUserExist.auths,
                        {
                            provider: "google",
                            providerId: profile.id
                        }
                    ]

                    isUserExist.picture = profile.photos?.[0].value

                    await isUserExist.save()
                }

                if (!isUserExist) {
                    isUserExist = await User.create({
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

                return done(null, isUserExist)

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