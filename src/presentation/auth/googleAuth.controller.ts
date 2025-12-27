import passport from "passport";
import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/role.enum";
import { NextFunction, Request, Response } from "express";
import { appConfig, appUrlConfig } from "../../config/env";
import { IUserRepository } from "../../domain/interfaces/repositories/IUser.repository";
import { IAesEncryption } from "../../domain/interfaces/services/IAesEncryption.service";
import { AesEncryptionImpl } from "../../infrastructure/services/aesEncryptionService.impl";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { IProviderRepository } from "../../domain/interfaces/repositories/IProvider.repository";
import { ICredentialRepository } from "../../domain/interfaces/repositories/ICredentialRepository";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { GoogleAuthOrchestratorUseCase } from "../../application/useCases/auth/googleAuthOrchestrate.useCase";
import { CredentialRepositoryImpl } from "../../infrastructure/database/credential/credential.repository.impl";

const aesEncryption: IAesEncryption = new AesEncryptionImpl();
const userRepository: IUserRepository = new UserRepositoryImpl();
const providerRepository: IProviderRepository = new ProviderRepositoryImpl();
const credentialRepository: ICredentialRepository = new CredentialRepositoryImpl();

const googleAuthOrchestratorUseCase = new GoogleAuthOrchestratorUseCase(userRepository, providerRepository, credentialRepository, aesEncryption);

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
                state: JSON.stringify({ role }),
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
                        return res.redirect(`${appUrlConfig.frontendUrl}/${info.role === Role.Provider ? "provider" : "user"}/settings?response=${redirectData}`);
                    } else {
                        return res.redirect(`${appUrlConfig.frontendUrl}/login?error=google_auth_failed`);
                    }
                }

                const role = user.role;
                const expiryDate = new Date(Date.now() + 60 * 60 * 1000);

                console.log("google auth callback token storing")
                console.log("User : ", user);
                console.log("expiryDate : ", expiryDate);

                const { token } = await this.googleAuthOrchestratorUseCase.execute({
                    email: user.email,
                    googleId: user.googleId,
                    name: user.name,
                    role,
                    connectOnly: user.connectOnly,
                    image: user.image,
                    userId: user.UserId,
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
                    return res.redirect(`${appUrlConfig.frontendUrl}/${role === Role.Provider ? "provider" : "user"}/settings?response=${redirectData}`);
                }

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









