import { googleClientConfig } from "../../config/env";
import { IGoogleRefreshTokenService } from "../../domain/interfaces/services/IGoogleRefreshToken.service";

export class GoogleRefreshTokenServiceImpl implements IGoogleRefreshTokenService {

    async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number; }> {
        const response = await get("https://oauth2.googleapis.com/token", {
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
        if (!data.access_token) throw new Error("Failed to refresh token");

        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in
        };
    };

};