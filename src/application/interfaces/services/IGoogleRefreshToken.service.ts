export interface IGoogleRefreshTokenService {

    refreshAccessToken(refreshToken: string): Promise<{ accessToken: string, refreshToken: string, expiresIn: number }>;

};