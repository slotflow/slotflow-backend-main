import { Redis } from '@upstash/redis';
import { redisConfig } from '../../config/env';
import { log } from '../../shared/logger/logger';
import { generateOTP } from 'otp-generator-module';
import { IOTPService } from '../../domain/interfaces/services/IOtp.service';

export class OTPServiceImpl implements IOTPService {

  constructor(
    private readonly redisClient: Redis
  ) { };

  async setOtp(email: string): Promise<string> {
    try {
      const otp = generateOTP({ length: 6 });
      await this.redisClient.set(email, otp, { ex: redisConfig.redisOtpTtl });
      return otp;
    } catch (error) {
      log.error("setOtp failed", error as Error);
      throw error;
    };
  };

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    try {
      const storedOtp = await this.redisClient.get(email);
      return storedOtp == otp;
    } catch (error) {
      log.error("verifyOtp failed", error as Error);
      throw error;
    }
  };

  async deleteOtp(email: string): Promise<void> {
    try {
      await this.redisClient.del(email);
    } catch (error) {
      log.error("deleteOtp failed : ", error as Error);
      throw new Error;
    };
  };

};
