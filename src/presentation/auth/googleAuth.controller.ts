import passport from "passport";
import { log } from "../../shared/logger/logger";
import { googleAuthOrchestratorUseCase } from ".";
import { NextFunction, Request, Response } from "express";
import { GoogleOAuthUser } from "../../application/dtos/common.dto";
import { appConfig, callbackConfig, serviceConfig } from "../../config/env";
import { GoogleAuthOrchestratorUseCase } from "../../application/useCases/auth/googleAuthOrchestrate.useCase";

class GoogleAuthController {
    constructor(
        private googleAuthOrchestratorUseCase: GoogleAuthOrchestratorUseCase,
    ) {
        this.googleAuth = this.googleAuth.bind(this);
        this.googleAuthCallback = this.googleAuthCallback.bind(this);
    };

    async googleAuth(req: Request, res: Response, next: NextFunction) {
        try {
            passport.authenticate("google", {
                scope: [
                    "openid",
                    "profile",
                    "email",
                ],
                accessType: "offline",
                prompt: "consent",
                session: false,
            })(req, res, next);
        } catch (error) {
            log.error("googleAuth failed", error as Error);
            next(error);
        };
    };

    async googleAuthCallback(req: Request, res: Response, next: NextFunction) {
        try {
            passport.authenticate("google", { session: false }, async (err, user: GoogleOAuthUser, info) => {

                let fallbackRoute = callbackConfig.authUrl;
                if (err || !user) {
                    const errorPayload = {
                        success: false,
                        error: "GOOGLE_AUTH_FAILED",
                    };

                    const redirectData = encodeURIComponent(JSON.stringify(errorPayload));
                    return res.redirect(`${serviceConfig.frontendUrl}${fallbackRoute}?response=${redirectData}`);
                }

                const { token, user: googleUser } = await this.googleAuthOrchestratorUseCase.execute({
                    email: user.email,
                    googleId: user.googleId,
                    name: user.name,
                    image: user.image,
                });

                res.cookie("token", token, {
                    maxAge: 2 * 24 * 60 * 60 * 1000,
                    httpOnly: true,
                    sameSite: appConfig.nodeEnv === "development" ? "lax" : "none",
                    secure: appConfig.nodeEnv !== "development",
                });

                const successPayload = {
                    success: true,
                    user: googleUser,
                };

                const redirectData = JSON.stringify(successPayload);
                return res.redirect(`${serviceConfig.frontendUrl}${fallbackRoute}?response=${encodeURIComponent(redirectData)}`);

            })(req, res);
        } catch (error) {
            next(error);
        };
    };
};

export const googleAuthController = new GoogleAuthController(
    googleAuthOrchestratorUseCase
);