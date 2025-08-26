import passport from 'passport';
import { googleClientConfig } from '../../config/env';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserRepositoryImpl } from '../database/user/user.repository.impl';
import { ProviderRepositoryImpl } from '../database/provider/provider.repository.impl';
import { GoogleAuthUseCase } from '../../application/auth-use.case/googleAuth.use-case';

const userRepositoryImpl = new UserRepositoryImpl();
const providerRepositoryImpl = new ProviderRepositoryImpl();
const googleAuthUseCase = new GoogleAuthUseCase(userRepositoryImpl, providerRepositoryImpl);

passport.use(
    new GoogleStrategy(
        {
            clientID: googleClientConfig.googleClientId!,
            clientSecret: googleClientConfig.googleClientSecret!,
            callbackURL: "http://localhost:3000/api/auth/google/callback",
            passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                const role = (req.query.state as string) || "USER";

                const entity = await googleAuthUseCase.execute({
                    googleId: profile.id,
                    email: profile.emails?.[0].value || "",
                    name: profile.displayName || "",
                    role: role as "USER" | "PROVIDER",
                    image: profile.photos?.[0]?.value || null,
                });

                console.log("entity : ",entity);

                return done(null, entity);
            } catch (error) {
                return done(error, undefined);
            }
        }
    )
)