import jwt from "jsonwebtoken";
import passport from "passport";
import { appConfig, appUrl } from "../../config/env";
import { redis } from "../../infrastructure/lib/redis";
import { NextFunction, Request, Response } from "express";
import { HandleError } from "../../infrastructure/error/error";

export class GoogleAuthController {
    constructor() { }

    async googleAuth(req: Request, res: Response, next: NextFunction) {

        try {
            const role = req.query.role;
            passport.authenticate("google", {
                scope: [
                    "openid",
                    "profile",
                    "email",
                    "https://www.googleapis.com/auth/calendar.events.owned",
                    "https://www.googleapis.com/auth/calendar.events.owned.readonly"
                ],
                prompt: "select_account",
                session: false,
                state: JSON.stringify({ role }),
            })(req, res, next);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

    async googleAuthCallback(req: Request, res: Response) {
        try {

            passport.authenticate("google", { session: false }, async (err, user, info) => {

                if (err || !user) {
                    return res.redirect("/login?error=google_auth_failed");
                }

                const role = info?.role || user.role;
                const token = jwt.sign({ userOrProviderId: user._id, role }, process.env.JWT_SECRET!, { expiresIn: "1h" });
                const authUser = { ...user, token };

                res.cookie("token", token, {
                    maxAge: 2 * 24 * 60 * 60 * 1000,
                    httpOnly: true,
                    sameSite: appConfig.nodeEnv === "development" ? "lax" : "none",
                    secure: appConfig.nodeEnv !== "development",
                });

                const { token: _, googleAccessToken, googleRefreshToken, ...authUserWithoutToken } = authUser;
                authUserWithoutToken.role = role;
                authUserWithoutToken.googleConnected = !!user.googleAccessToken;

                await redis.set(`google:accessToken:${user._id}`, googleAccessToken, { ex: 3600 });
                await redis.set(`google:refreshToken:${user._id}`, googleRefreshToken);

                const authUserWithoutTokenJson = JSON.stringify(authUserWithoutToken);
                const frontendUrl = appUrl.frontendUrl;
                return res.redirect(`${frontendUrl}?authUser=${encodeURIComponent(authUserWithoutTokenJson)}`);
            })(req, res);

        } catch (error) {
            HandleError.handle(error, res);
        }
    }
}

const googleAuthController = new GoogleAuthController();

export { googleAuthController };