import passport from "passport";
import { googleClientConfig } from "../../config/env";
import { GoogleOAuthUser } from "../../application/dtos/common.dto";
import { Strategy as GoogleStrategy, VerifyCallback, Profile } from "passport-google-oauth20";
import { IGooglePassportStrategy } from "../../application/interfaces/passport/IGooglePassport.stratergy";
import { Request } from "express";

export class GooglePassportStrategyImpl implements IGooglePassportStrategy {
  constructor() {}

  register(): void {
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientConfig.googleClientId!,
          clientSecret: googleClientConfig.googleClientSecret!,
          callbackURL: googleClientConfig.googleCallbackUrl,
          passReqToCallback: true,
        },
        async (
          _req: Request,
          accessToken: string,
          refreshToken: string,
          _params: { expires_in: number },
          profile: Profile,
          done: VerifyCallback,
        ) => {
          try {
            const userPayload: GoogleOAuthUser = {
              googleAccessToken: accessToken,
              googleRefreshToken: refreshToken,
              googleId: profile.id,
              email: profile.emails?.[0]?.value || "",
              name: profile.displayName || "",
              image: profile.photos?.[0]?.value || null,
            };

            return done(null, userPayload);
          } catch (err) {
            return done(err);
          }
        },
      ),
    );
  }
}
