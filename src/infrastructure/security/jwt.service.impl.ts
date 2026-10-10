import { jwtConfig } from "../../config/env";
import jwt, { JwtPayload } from "jsonwebtoken";
import { log } from "../../shared/logger/logger";
import { ERROR_CODES } from "../../shared/utils/types/enums";
import { JwtClaims } from "../../application/dtos/common.dto";
import { IJWT } from "../../application/interfaces/security/IJwt.service";
import { AppError, BadRequestError, UnauthorizedError } from "../../shared/error/appError";

export class JWTImpl implements IJWT {
  async generateToken(input: JwtClaims, expiresIn: string = "2d"): Promise<string> {
    try {
      if (!input) {
        throw new BadRequestError("Invalid token payload", ERROR_CODES.INVALID_REQUEST);
      }
      return jwt.sign(input, jwtConfig.jwtSecret, {
        expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
      });
    } catch (error) {
      log.error("generateToken failed", { error });

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("Token generation failed", 500, false, ERROR_CODES.INTERNAL_ERROR);
    }
  }

  async verifyToken(token: string): Promise<JwtClaims> {
    try {
      if (!token) {
        throw new UnauthorizedError("Token is required", ERROR_CODES.UNAUTHORIZED);
      }
      const decoded = jwt.verify(token, jwtConfig.jwtSecret);

      if (typeof decoded === "string") {
        throw new UnauthorizedError("Invalid token format", ERROR_CODES.INVALID_TOKEN);
      }

      return decoded as JwtPayload as JwtClaims;
    } catch (error) {
      log.error("verifyToken failed", { error });

      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError("Token expired", ERROR_CODES.TOKEN_EXPIRED);
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError("Invalid token", ERROR_CODES.INVALID_TOKEN);
      }

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("Token verification failed", 500, false, ERROR_CODES.INTERNAL_ERROR);
    }
  }
}
