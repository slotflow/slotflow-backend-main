import { AccessTokenClaims, RefreshTokenClaims } from "../../dtos/common.dto";

export interface IJWT {
  generateAccessToken(input: AccessTokenClaims): Promise<string>;

  verifyAccessToken(token: string): Promise<AccessTokenClaims>;

  generateRefreshToken(input: RefreshTokenClaims): Promise<string>;

  verifyRefreshToken(token: string): Promise<RefreshTokenClaims>;
}
