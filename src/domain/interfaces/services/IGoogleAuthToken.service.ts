export interface IGoogleAuthTokenService {
    refreshAccessToken(refreshToken: string): Promise<{ accessToken: string, refreshToken: string, expiresIn: Date }>
}