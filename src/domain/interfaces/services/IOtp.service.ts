export interface IOTPService {

    setOtp(email: string): Promise<string>;

    verifyOtp(email: string, otp: string): Promise<boolean>;

    deleteOtp(email: string): Promise<void>;

};