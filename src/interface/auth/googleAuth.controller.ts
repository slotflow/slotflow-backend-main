import passport from "passport";
import jwt from "jsonwebtoken";
import { appConfig } from "../../config/env";
import { NextFunction, Request, Response } from "express";

export class GoogleAuthController {
    constructor() {}

    async googleAuth(req: Request, res: Response, next: NextFunction) {

        try {
            const role = req.query.role;
            passport.authenticate("google", {
                scope: ["openid", "profile", "email"],
                session: false,
                state: JSON.stringify({ role }),
            })(req, res, next);
        } catch (error) {
            console.log("google auth controller error : ", error);
        }
    }

    async googleAuthCallback(req: Request, res: Response) {
        try {

            passport.authenticate("google", { session: false }, (err, user, info) => {
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

                const { token: _, ...authUserWithoutToken } = authUser;
                authUserWithoutToken.role = role;

                const authUserWithoutTokenJson = JSON.stringify(authUserWithoutToken);
                return res.redirect(`http://localhost:5173?authUser=${encodeURIComponent(authUserWithoutTokenJson)}`);
            })(req, res);

        } catch (error) {
            console.log("gooe auth callback error : ", error);
        }
    }
}

const googleAuthController = new GoogleAuthController();
export { googleAuthController };