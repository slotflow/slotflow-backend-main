import { GaxiosError } from "gaxios";
import { googleClientConfig } from "../../config/env";
import { ERROR_CODES } from "../../shared/utils/types/enums";
import { AppError, UnauthorizedError } from "../../shared/error/appError";
import { IGoogleRefreshTokenService } from "../../application/interfaces/services/IGoogleRefreshToken.service";

interface GoogleOAuthErrorResponse {
  error?: string;
  error_description?: string;
}

interface GoogleOAuthSuccessResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

export class GoogleRefreshTokenServiceImpl implements IGoogleRefreshTokenService {
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      if (!refreshToken) {
        throw new UnauthorizedError("Refresh token missing", ERROR_CODES.TOKEN_MISSING);
      }

      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: googleClientConfig.googleClientId!,
          client_secret: googleClientConfig.googleClientSecret!,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      });

      const data = (await response.json()) as GoogleOAuthSuccessResponse | GoogleOAuthErrorResponse;

      if (!response.ok) {
        this.handleGoogleOAuthError(data as GoogleOAuthErrorResponse, response.status);
      }

      const tokenData = data as GoogleOAuthSuccessResponse;

      if (!tokenData.access_token) {
        throw new AppError(
          "Failed to refresh access token",
          502,
          false,
          ERROR_CODES.GOOGLE_API_ERROR,
        );
      }

      return {
        accessToken: tokenData.access_token,
        // Google may omit refresh_token when refreshing an existing token.
        refreshToken: tokenData.refresh_token ?? refreshToken,
        expiresIn: tokenData.expires_in!,
      };
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof GaxiosError) {
        throw this.handleGoogleGaxiosError(error);
      }

      throw new AppError(
        "Google token service unavailable",
        502,
        false,
        ERROR_CODES.GOOGLE_API_ERROR,
      );
    }
  }

  private handleGoogleOAuthError(data: GoogleOAuthErrorResponse, status: number): never {
    const error = data?.error;

    if (error === "invalid_grant") {
      throw new UnauthorizedError("Refresh token expired or revoked", ERROR_CODES.TOKEN_EXPIRED);
    }

    if (error === "invalid_client") {
      throw new AppError(
        "Google OAuth client configuration error",
        500,
        false,
        ERROR_CODES.INTERNAL_ERROR,
      );
    }

    if (status === 400) {
      throw new AppError("Invalid request to Google OAuth", 400, true, ERROR_CODES.INVALID_REQUEST);
    }

    throw new AppError(
      "Google OAuth token refresh failed",
      502,
      false,
      ERROR_CODES.GOOGLE_API_ERROR,
    );
  }

  private handleGoogleGaxiosError(error: GaxiosError): AppError {
    const status = error.response?.status;

    if (status === 401) {
      return new UnauthorizedError("Refresh token expired or revoked", ERROR_CODES.TOKEN_EXPIRED);
    }

    if (status === 403) {
      return new AppError("Google permission denied", 403, true, ERROR_CODES.FORBIDDEN);
    }

    if (status === 429) {
      return new AppError(
        "Google API rate limit exceeded",
        429,
        true,
        ERROR_CODES.GOOGLE_API_ERROR,
      );
    }

    return new AppError(
      "Google OAuth token refresh failed",
      502,
      false,
      ERROR_CODES.GOOGLE_API_ERROR,
    );
  }
}
