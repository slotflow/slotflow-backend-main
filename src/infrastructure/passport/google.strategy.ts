import passport from "passport";
import { googleClientConfig } from "../../config/env";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

export class GooglePassportStrategyImpl {
  constructor(
  ) { };

  register(): void {
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientConfig.googleClientId!,
          clientSecret: googleClientConfig.googleClientSecret!,
          callbackURL: googleClientConfig.googleCallbackUrl,
          passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            const state = req.query.state
              ? JSON.parse(req.query.state as string)
              : {};

            return done(null, {
              googleAccessToken: accessToken,
              googleRefreshToken: refreshToken,
              googleId: profile.id,
              email: profile.emails?.[0].value || "",
              name: profile.displayName || "",
              image: profile.photos?.[0]?.value || null,
              role: state.role,
              connectOnly: state.connectOnly,
              userId: state.userId,
            }, {});

          } catch (err) {
            return done(err);
          };
        },
      ),
    );
  };
};
