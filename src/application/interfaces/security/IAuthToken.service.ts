import { AuthTokens, AccessTokenClaims } from "../../dtos/common.dto";

export interface IAuthTokenService {
  issueTokens(claims: AccessTokenClaims): Promise<AuthTokens>;

  verifyRefreshToken(refreshToken: string): Promise<string>;

  refreshAccessToken(claims: AccessTokenClaims): Promise<string>;
}
