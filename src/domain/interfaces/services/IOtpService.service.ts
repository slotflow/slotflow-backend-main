export interface IOTPService {

    setOtp(verificationToken: string): Promise<string>;

    verifyOtp(verificationToken: string, otp: string): Promise<boolean>;

};