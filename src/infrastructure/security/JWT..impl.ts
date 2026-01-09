import { jwtConfig } from "../../config/env";
import jwt, { JwtPayload } from "jsonwebtoken";
import { log } from "../../shared/logger/logger";
import { IJWT } from "../../domain/interfaces/security/IJwt";
import { JwtClaims } from "../../domain/commands/jwt.commands";

export class JWTImpl implements IJWT {

  async generateToken(payload: JwtClaims,expiresIn: string = "2d"): Promise<string> {
    try {
      return jwt.sign(payload, jwtConfig.jwtSecret, {
        expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
      });
    } catch (error) {
      log.error("generateToken failed", error as Error);
      throw new Error("Access token generation failed");
    }
  }

  async verifyToken(token: string): Promise<JwtClaims> {
    try {
      const decoded = jwt.verify(token, jwtConfig.jwtSecret);

      if (typeof decoded === "string") {
        throw new Error("Invalid token format");
      }

      return decoded as JwtPayload as JwtClaims;
    } catch (error) {
      log.error("verifyToken failed", error as Error);
      throw new Error("Token verification failed");
    }
  }
}
