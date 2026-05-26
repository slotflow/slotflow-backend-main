import { googleClientConfig } from "../../config/env";
import { ERROR_CODES } from "../../shared/utils/types";
import { AppError, UnauthorizedError } from "../../shared/error/appError";
import { IGoogleRefreshTokenService } from "../../domain/interfaces/services/IGoogleRefreshToken.service";

export class GoogleRefreshTokenServiceImpl implements IGoogleRefreshTokenService {

    async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number; }> {
        try {
            if (!refreshToken) {
                throw new UnauthorizedError(
                    "Refresh token missing",
                    ERROR_CODES.TOKEN_MISSING
                );
            }

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
            if (!response.ok) {
                return this.handleGoogleOAuthError(data, response.status);
            }

            if (!data.access_token) {
                throw new AppError(
                    "Failed to refresh access token",
                    502,
                    false,
                    ERROR_CODES.GOOGLE_API_ERROR
                );
            }

            return {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresIn: data.expires_in
            };
        } catch (error: unknown) {
            if (error instanceof AppError) {
                throw error;
            }

            throw new AppError(
                "Google token service unavailable",
                502,
                false,
                ERROR_CODES.GOOGLE_API_ERROR
            );
        }
    };

    private handleGoogleOAuthError(data: any, status: number): never {

        const error = data?.error;

        if (error === "invalid_grant") {
            throw new UnauthorizedError(
                "Refresh token expired or revoked",
                ERROR_CODES.TOKEN_EXPIRED
            );
        }

        if (error === "invalid_client") {
            throw new AppError(
                "Google OAuth client configuration error",
                500,
                false,
                ERROR_CODES.INTERNAL_ERROR
            );
        }

        if (status === 400) {
            throw new AppError(
                "Invalid request to Google OAuth",
                400,
                true,
                ERROR_CODES.INVALID_REQUEST
            );
        }

        throw new AppError(
            "Google OAuth token refresh failed",
            502,
            false,
            ERROR_CODES.GOOGLE_API_ERROR
        );
    }

};