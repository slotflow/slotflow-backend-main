import { Redis } from '@upstash/redis';
import { redisConfig } from '../../config/env';
import { log } from '../../shared/logger/logger';
import { generateOTP } from 'otp-generator-module';
import { IOTPService } from '../../domain/interfaces/services/IOtp.service';

export class OTPServiceImpl implements IOTPService {

  constructor(
    private readonly redisClient: Redis
  ) { };

  async setOtp(verificationToken: string): Promise<string> {
    try {
      const otp = generateOTP({ length: 6 });
      await this.redisClient.set(verificationToken, otp, { ex: redisConfig.redisOtpTtl });
      return otp;
    } catch (error) {
      log.error("setOtp failed", error as Error);
      throw error;
    };
  };

  async verifyOtp(verificationToken: string, otp: string): Promise<boolean> {
    try {
      const storedOtp = await this.redisClient.get(verificationToken);
      return storedOtp == otp;
    } catch (error) {
      log.error("verifyOtp failed", error as Error);
      throw error;
    }
  };

  async deleteOtp(verificationToken: string): Promise<void> {
    try {
      await this.redisClient.del(verificationToken);
    } catch (error) {
      log.error("deleteOtp failed : ", error as Error);
      throw new Error;
    };
  };

};
