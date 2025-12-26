import { redis } from '../lib/redis';
import { log } from '../../shared/logger/logger';
import { generateOTP } from 'otp-generator-module';
import { IOTPService } from '../../domain/interfaces/services/IOtpService.service';

export class OTPService implements IOTPService {

  async setOtp(verificationToken: string): Promise<string> {
    try {
      const otp = generateOTP({ length: 6 });
      await redis.set(verificationToken, otp, { px: 300000 });
      return otp;
    } catch (error) {
      log.error("setOtp failed", error as Error);
      throw error;
    };
  };

  async verifyOtp(verificationToken: string, otp: string): Promise<boolean> {
    try {
      const storedOtp = await redis.get(verificationToken);
      return storedOtp == otp;
    } catch (error) {
      log.error("verifyOtp failed", error as Error);
      throw error;
    }
  };

}
