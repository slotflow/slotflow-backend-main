import {
  AuthTokens,
  AccessTokenClaims,
  RefreshTokenClaims,
} from "../../application/dtos/common.dto";
import { UnauthorizedError } from "../../shared/error/appError";
import { IJWT } from "../../application/interfaces/security/IJwt.service";
import { IAuthTokenService } from "../../application/interfaces/security/IAuthToken.service";

export class AuthTokenService implements IAuthTokenService {
  constructor(private readonly jwtService: IJWT) {}

  async issueTokens(claims: AccessTokenClaims): Promise<AuthTokens> {
    if (!claims.userId) {
      throw new UnauthorizedError("Invalid user claims");
    }

    const refreshClaims: RefreshTokenClaims = {
      userId: claims.userId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.generateAccessToken(claims),
      this.jwtService.generateRefreshToken(refreshClaims),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyRefreshToken(refreshToken: string): Promise<string> {
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token is required");
    }

    const claims = await this.jwtService.verifyRefreshToken(refreshToken);

    if (!claims.userId) {
      throw new UnauthorizedError("Invalid refresh token payload");
    }

    return claims.userId;
  }

  async refreshAccessToken(claims: AccessTokenClaims): Promise<string> {
    if (!claims.userId) {
      throw new UnauthorizedError("Invalid user claims");
    }

    return this.jwtService.generateAccessToken(claims);
  }
}
