import passport from 'passport';
import { Types } from 'mongoose';
import { RoleType } from '../dtos/common.dto';
import { roleArray } from '../../utils/constants';
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

                let role;
                let connectOnly;
                let entity;
                let _id;
                if (req.query.state) {
                    try {
                        const parsed = JSON.parse(req.query.state as string);
                        if (parsed.role === roleArray[2] || parsed.role === roleArray[1]) {
                            role = parsed.role;
                        }
                        connectOnly = parsed.connectOnly;
                        _id = parsed.userId;
                    } catch (e) {
                        console.warn("Failed to parse state:", req.query.state);
                        throw new Error("Failed to parse state in passport");
                    }
                }

                if(!connectOnly) {
                    entity = await googleAuthUseCase.execute({
                        googleId: profile.id,
                        email: profile.emails?.[0].value || "",
                        name: profile.displayName || "",
                        role: role as RoleType,
                        image: profile.photos?.[0]?.value || null,
                    });
                } else {
                    if(role === roleArray[2]) {
                        const provider = await providerRepositoryImpl.findProviderById(new Types.ObjectId(_id));
                        if(!provider) throw new Error("User not found");
                        provider.googleId = profile.id;
                        provider.googleConnected = true;
                        entity = await providerRepositoryImpl.updateProvider(provider);
                    }else if(role === roleArray[1]) {
                        const user = await userRepositoryImpl.findUserById(new Types.ObjectId(_id));
                        if(!user) throw new Error("User not found");
                        user.googleId = profile.id;
                        user.googleConnected = true;
                        entity = await userRepositoryImpl.updateUser(user);
                    }
                }

                const data = {...entity, googleAccessToken: accessToken, googleRefreshToken: refreshToken  }

                return done(null, data, { role, connectOnly });
            } catch (error) {
                console.log("Passport error : ", error);
                return done(error, undefined);
            }
        }
    )
)