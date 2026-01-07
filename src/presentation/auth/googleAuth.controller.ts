import passport from "passport";
import { log } from "../../shared/logger/logger";
import { googleAuthOrchestratorUseCase } from ".";
import { Role } from "../../domain/enums/role.enum";
import { NextFunction, Request, Response } from "express";
import { appConfig, appUrlConfig } from "../../config/env";
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
            console.log("google auth login");
            const role = req.query.role;
            passport.authenticate("google", {
                scope: [
                    "openid",
                    "profile",
                    "email",
                    "https://www.googleapis.com/auth/calendar.events.owned",
                    "https://www.googleapis.com/auth/calendar.events.owned.readonly"
                ],
                accessType: "offline",
                prompt: "consent",
                session: false,
                state: JSON.stringify({ role, connectOnly: false }),
            })(req, res, next);
        } catch (error) {
            log.error("googleAuth failed", error as Error);
            next(error);
        };
    };

    async googleAuthCallback(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("google auth callback");
            passport.authenticate("google", { session: false }, async (err, user, info) => {

                if (err || !user) {
                    if (info.connectOnly) {
                        const errorPayload = {
                            success: false,
                            error: "GOOGLE_CONNECT_FAILED",
                            googleConnect: false
                        };

                        const redirectData = encodeURIComponent(JSON.stringify(errorPayload));
                        return res.redirect(`${appUrlConfig.frontendUrl}/${info.role === Role.Provider ? "provider" : "user"}/integrations?response=${redirectData}`);
                    } else {
                        return res.redirect(`${appUrlConfig.frontendUrl}/login?error=google_auth_failed`);
                    }
                }

                const role = user.role;
                const expiryDate = new Date(Date.now() + 60 * 60 * 1000);

                const { token, user: updatedUser } = await this.googleAuthOrchestratorUseCase.execute({
                    email: user.email,
                    googleId: user.googleId,
                    name: user.name,
                    role,
                    connectOnly: user.connectOnly,
                    image: user.image,
                    userId: user.userId,
                    accessToken: user.googleAccessToken,
                    refreshToken: user.googleRefreshToken,
                    expiryDate,
                });

                if (user.connectOnly) {
                    const successPayload = {
                        success: true,
                        googleConnected: true,
                    };
                    const redirectData = encodeURIComponent(JSON.stringify(successPayload));
                    return res.redirect(`${appUrlConfig.frontendUrl}/${role === Role.Provider ? "provider" : "user"}/integrations?response=${redirectData}`);
                };

                res.cookie("token", token, {
                    maxAge: 2 * 24 * 60 * 60 * 1000,
                    httpOnly: true,
                    sameSite: appConfig.nodeEnv === "development" ? "lax" : "none",
                    secure: appConfig.nodeEnv !== "development",
                });

                const authUserWithoutToken = {
                    email: user.email,
                    name: user.name,
                    role,
                    googleConnected: !!user.googleAccessToken,
                    image: user.image,
                    googleId: user.googleId,
                    ...updatedUser
                };

                const authUserWithoutTokenJson = JSON.stringify(authUserWithoutToken);
                const frontendUrl = appUrlConfig.frontendUrl;
                return res.redirect(`${frontendUrl}?authUser=${encodeURIComponent(authUserWithoutTokenJson)}`);
            })(req, res);
        } catch (error) {
            log.error("googleAuthCallback failed", error as Error);
            next(error);
        };
    };
};

export const googleAuthController = new GoogleAuthController(
    googleAuthOrchestratorUseCase
);









