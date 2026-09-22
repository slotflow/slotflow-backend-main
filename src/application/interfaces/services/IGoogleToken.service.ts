export interface IGoogleTokenService {

    getAccessToken(userId: string): Promise<string>;

};