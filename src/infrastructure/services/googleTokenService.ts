import { Types } from "mongoose";
// import { redis } from "../lib/redis";
import { googleClientConfig } from "../../config/env";
import { GetCredentialUseCase, UpdateCredentialUseCase } from "../../application/common-use.case/credential.use-case";

export class GoogleTokenService {
    constructor(
        private getCredentialUseCase: GetCredentialUseCase,
        private updateCredentialUseCase: UpdateCredentialUseCase
    ) { }

    async getValidAccessToken(userId: Types.ObjectId): Promise<string> {
        try {

            const credentials = await this.getCredentialUseCase.execute(userId);
            
            // let accessToken = await redis.get<string>(`google:accessToken:${userId}`);

            if(!credentials) throw new Error("Credentials fetchinga failed");
            const now = new Date();

            if (!credentials.accessToken || now > credentials.expiryDate) {
                // const refreshToken = await redis.get<string>(`google:refreshToken:${userId}`);
                if (!credentials.refreshToken) throw new Error("No refresh token found");

                const response = await fetch("https://oauth2.googleapis.com/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        client_id: googleClientConfig.googleClientId!,
                        client_secret: googleClientConfig.googleClientSecret!,
                        refresh_token: credentials.refreshToken,
                        grant_type: "refresh_token",
                    }),
                });

                const data = await response.json();
                if (!data.access_token) throw new Error("Failed to refresh access token");

                credentials.accessToken = data.access_token;
                if (data.refresh_token) {
                    credentials.refreshToken = data.refresh_token;
                }
                credentials.expiryDate = new Date(Date.now() + data.expires_in * 1000);
                if (!credentials.accessToken) throw new Error("Failed to refresh access token");
                // await redis.set(`google:accessToken:${userId}`, accessToken, { ex: data.expires_in });

                const res =await this.updateCredentialUseCase.execute(credentials);
                if(!res.success) throw new Error("Credentials updation error");
            }

            return credentials.accessToken;
        } catch {
            throw new Error("Google validate token failed");
        }
    }
}
