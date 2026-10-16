import { jwtConfig } from "../../config/env";
import { log } from "../../shared/logger/logger";
import { ERROR_CODES } from "../../shared/utils/types/enums";
import jwt, { JwtPayload, SignOptions, VerifyOptions } from "jsonwebtoken";
import { AppError, BadRequestError, UnauthorizedError } from "../../shared/error/appError";
import { AccessTokenClaims, RefreshTokenClaims } from "../../application/dtos/common.dto";
import { IJWT } from "../../application/interfaces/security/IJwt.service";

type TokenType = "access" | "refresh";

export class JWTImpl implements IJWT {
  private readonly issuer = "slotflow-auth";
  private readonly accessAudience = "slotflow-api";
  private readonly refreshAudience = "slotflow-refresh";
  private readonly algorithm: SignOptions["algorithm"] = "HS256";

  async generateAccessToken(input: AccessTokenClaims): Promise<string> {
    return this.signToken(input, jwtConfig.jwtAccessSecret, "1h", this.accessAudience, "access");
  }

  async verifyAccessToken(token: string): Promise<AccessTokenClaims> {
    const decoded = this.verifyToken(
      token,
      jwtConfig.jwtAccessSecret,
      this.accessAudience,
      "access",
    );

    return decoded as AccessTokenClaims;
  }

  async generateRefreshToken(input: RefreshTokenClaims): Promise<string> {
    if (!input || typeof input.userId !== "string" || !input.userId) {
      throw new BadRequestError("Invalid refresh token payload", ERROR_CODES.INVALID_REQUEST);
    }

    return this.signToken(
      { userId: input.userId },
      jwtConfig.jwtRefreshSecret,
      "2d",
      this.refreshAudience,
      "refresh",
    );
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenClaims> {
    const decoded = this.verifyToken(
      token,
      jwtConfig.jwtRefreshSecret,
      this.refreshAudience,
      "refresh",
    );

    if (typeof decoded.userId !== "string" || !decoded.userId) {
      throw new UnauthorizedError("Invalid refresh token payload", ERROR_CODES.INVALID_TOKEN);
    }

    return decoded as RefreshTokenClaims;
  }

  private signToken(
    payload: JwtPayload,
    secret: string,
    expiresIn: SignOptions["expiresIn"],
    audience: string,
    tokenType: TokenType,
  ): string {
    try {
      const options: SignOptions = {
        algorithm: this.algorithm,
        expiresIn,
        issuer: this.issuer,
        audience,
      };

      return jwt.sign(
        {
          ...payload,
          tokenType,
        },
        secret,
        options,
      );
    } catch (error) {
      log.error("Token generation failed", {
        error,
        tokenType,
      });

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("Token generation failed", 500, false, ERROR_CODES.INTERNAL_ERROR);
    }
  }

  private verifyToken(
    token: string,
    secret: string,
    audience: string,
    tokenType: TokenType,
  ): JwtPayload {
    try {
      if (!token) {
        throw new UnauthorizedError("Token is required", ERROR_CODES.UNAUTHORIZED);
      }

      const options: VerifyOptions = {
        algorithms: ["HS256"],
        issuer: this.issuer,
        audience,
      };

      const decoded = jwt.verify(token, secret, options);

      return decoded as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError("Token expired", ERROR_CODES.TOKEN_EXPIRED);
      }

      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.NotBeforeError) {
        throw new UnauthorizedError("Invalid token", ERROR_CODES.INVALID_TOKEN);
      }

      if (error instanceof AppError) {
        throw error;
      }

      log.error("Token verification failed", {
        error,
        tokenType,
      });

      throw new AppError("Token verification failed", 500, false, ERROR_CODES.INTERNAL_ERROR);
    }
  }
}
