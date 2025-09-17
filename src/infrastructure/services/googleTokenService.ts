import { redis } from "../lib/redis";
import { googleClientConfig } from "../../config/env";

export class GoogleTokenService {
    constructor() { }

    async getValidAccessToken(userId: string): Promise<string> {
        try {
            let accessToken = await redis.get<string>(`google:accessToken:${userId}`);

            if (!accessToken) {
                const refreshToken = await redis.get<string>(`google:refreshToken:${userId}`);
                if (!refreshToken) throw new Error("No refresh token found");

                const response = await fetch("https://oauth2.googleapis.com/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        client_id: googleClientConfig.googleClientId!,
                        client_secret: googleClientConfig.googleClientSecret!,
                        refresh_token: refreshToken,
                        grant_type: "refresh_token",
                    }),
                });

                const data = await response.json();
                if (!data.access_token) throw new Error("Failed to refresh access token");

                accessToken = data.access_token;
                if (!accessToken) throw new Error("Failed to refresh access token");
                await redis.set(`google:accessToken:${userId}`, accessToken, { ex: data.expires_in });
            }

            return accessToken;
        } catch {
            throw new Error("Google validate token failed");
        }
    }
}
