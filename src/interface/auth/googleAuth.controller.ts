import jwt from "jsonwebtoken";
import passport from "passport";
import { Types } from "mongoose";
import { appConfig, appUrl } from "../../config/env";
// import { redis } from "../../infrastructure/lib/redis";
import { NextFunction, Request, Response } from "express";
import { HandleError } from "../../infrastructure/error/error";
import { AesEncryption } from "../../infrastructure/services/aesEncryption";
import { CreateCredentialUseCase } from "../../application/common-use.case/credential.use-case";
import { CredentialRepositoryImpl } from "../../infrastructure/database/credential/credential.repository.impl";
import { Role } from "../../infrastructure/dtos/common.dto";

const aesEncryption = new AesEncryption();
const credentialRepositoryImpl = new CredentialRepositoryImpl();
const createCredentialUseCase = new CreateCredentialUseCase(credentialRepositoryImpl, aesEncryption);

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
            HandleError.handle(error, res);
        }
    }

    async googleAuthCallback(req: Request, res: Response) {
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
                            `${appUrl.frontendUrl}/${info.role === Role.provider ? "provider" : "user"}/settings?response=${redirectData}`
                        );
                    } else {
                        return res.redirect(`${appUrl.frontendUrl}/login?error=google_auth_failed`);
                    }
                }

                const role = info?.role || user.role;
                const connectOnly = info.connectOnly;

                // await redis.set(`google:accessToken:${user._id}`, user.googleAccessToken, { ex: 3600 });
                // await redis.set(`google:refreshToken:${user._id}`, user.googleRefreshToken);

                const expiryDate = new Date(Date.now() + 60 * 60 * 1000);

                console.log("google auth callback token storing")
                console.log("User : ",user);
                console.log("expiryDate : ",expiryDate);
                await this.createCredentialUseCase.execute({
                    userId: new Types.ObjectId(user._id),
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
                    return res.redirect(`${appUrl.frontendUrl}/${role === Role.provider ? "provider" : "user"}/settings?response=${redirectData}`);
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
            console.log("google callback error : ",error);
            HandleError.handle(error, res);
        }
    }
}

const googleAuthController = new GoogleAuthController(
    createCredentialUseCase
);

export { googleAuthController };








