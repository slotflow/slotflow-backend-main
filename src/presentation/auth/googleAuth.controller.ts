import jwt from "jsonwebtoken";
import passport from "passport";
import { log } from "../../shared/logger/logger";
import { appConfig, appUrl } from "../../config/env";
import { roleArray } from "../../shared/utils/constants";
import { NextFunction, Request, Response } from "express";
import { AesEncryption } from "../../infrastructure/services/aesEncryption.service";
import { IAesEncryption } from "../../domain/interfaces/services/IAesEncryption.service";
import { CreateCredentialUseCase } from "../../application/useCases/common/credential.useCase";
import { ICredentialRepository } from "../../domain/interfaces/repositories/ICredentialRepository";
import { CredentialRepositoryImpl } from "../../infrastructure/database/credential/credential.repository.impl";

const aesEncryption: IAesEncryption = new AesEncryption();

const credentialRepository: ICredentialRepository = new CredentialRepositoryImpl();

const createCredentialUseCase = new CreateCredentialUseCase(credentialRepository, aesEncryption);

export class GoogleAuthController {
    constructor(
        private createCredentialUseCase: CreateCredentialUseCase,
    ) {
        this.googleAuth = this.googleAuth.bind(this);
        this.googleAuthCallback = this.googleAuthCallback.bind(this);
    }

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
                state: JSON.stringify({ role }),
            })(req, res, next);
        } catch (error) {
            log.error("googleAuth failed", error as Error);
            next(error);
        }
    }

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
                        return res.redirect(
                            `${appUrl.frontendUrl}/${info.role === roleArray[2] ? "provider" : "user"}/settings?response=${redirectData}`
                        );
                    } else {
                        return res.redirect(`${appUrl.frontendUrl}/login?error=google_auth_failed`);
                    }
                }

                const role = info?.role || user.role;
                const connectOnly = info.connectOnly;

                const expiryDate = new Date(Date.now() + 60 * 60 * 1000);

                console.log("google auth callback token storing")
                console.log("User : ", user);
                console.log("expiryDate : ", expiryDate);
                await this.createCredentialUseCase.execute({
                    userId: user._id,
                    accessToken: user.googleAccessToken,
                    refreshToken: user.googleRefreshToken,
                    expiryDate,
                });

                if (connectOnly) {
                    const successPayload = {
                        success: true,
                        googleConnected: true,
                    };
                    const redirectData = encodeURIComponent(JSON.stringify(successPayload));
                    return res.redirect(`${appUrl.frontendUrl}/${role === roleArray[2] ? "provider" : "user"}/settings?response=${redirectData}`);
                }

                const token = jwt.sign({ userOrProviderId: user._id, role }, process.env.JWT_SECRET!, { expiresIn: "1h" });

                res.cookie("token", token, {
                    maxAge: 2 * 24 * 60 * 60 * 1000,
                    httpOnly: true,
                    sameSite: appConfig.nodeEnv === "development" ? "lax" : "none",
                    secure: appConfig.nodeEnv !== "development",
                });

                const { token: _, googleAccessToken, googleRefreshToken, ...authUserWithoutToken } = user;
                authUserWithoutToken.role = role;
                authUserWithoutToken.googleConnected = !!user.googleAccessToken;

                const authUserWithoutTokenJson = JSON.stringify(authUserWithoutToken);
                const frontendUrl = appUrl.frontendUrl;
                return res.redirect(`${frontendUrl}?authUser=${encodeURIComponent(authUserWithoutTokenJson)}`);
            })(req, res);
        } catch (error) {
            log.error("googleAuthCallback failed", error as Error);
            next(error);
        }
    }
}

export const googleAuthController = new GoogleAuthController(
    createCredentialUseCase
);









