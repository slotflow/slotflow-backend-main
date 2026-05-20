import { Redis } from '@upstash/redis';
import { redisConfig } from '../../config/env';
import { log } from '../../shared/logger/logger';
import { generateOTP } from 'otp-generator-module';
import { ERROR_CODES } from '../../shared/utils/types';
import { IOTPService } from '../../domain/interfaces/services/IOtp.service';
import { AppError, BadRequestError, UnauthorizedError } from '../../shared/error/appError';

export class OTPServiceImpl implements IOTPService {

  constructor(
    private readonly redisClient: Redis
  ) { };

  async setOtp(email: string): Promise<string> {
    try {
      if (!email) {
        throw new BadRequestError(
          "Email is required",
          ERROR_CODES.INVALID_REQUEST
        );
      }
      const otp = generateOTP({ length: 6 });
      await this.redisClient.set(email, otp, { ex: redisConfig.redisOtpTtl });
      return otp;
    } catch (error) {
      log.error("setOtp failed", error as Error);

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        "Failed to generate OTP",
        500,
        false,
        ERROR_CODES.INTERNAL_ERROR
      );
    };
  };

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    try {
      if (!email || !otp) {
        throw new BadRequestError(
          "Email and OTP are required",
          ERROR_CODES.INVALID_REQUEST
        );
      }

      const storedOtp = await this.redisClient.get(email);

      if (!storedOtp) {
        throw new UnauthorizedError(
          "OTP expired or not found",
          ERROR_CODES.TOKEN_EXPIRED
        );
      }

      // Convert both to strings and trim to handle type mismatches
      const normalizedStoredOtp = String(storedOtp).trim();
      const normalizedOtp = String(otp).trim();

      if (normalizedStoredOtp !== normalizedOtp) {
        throw new UnauthorizedError(
          "Invalid OTP",
          ERROR_CODES.INVALID_REQUEST
        );
      }

      return normalizedStoredOtp === normalizedOtp;
    } catch (error) {
      log.error("verifyOtp failed", error as Error);

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        "Failed to verify OTP",
        500,
        false,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  };

  async deleteOtp(email: string): Promise<void> {
    try {
      if (!email) {
        throw new BadRequestError(
          "Email is required",
          ERROR_CODES.INVALID_REQUEST
        );
      }

      await this.redisClient.del(email);
    } catch (error) {
      log.error("deleteOtp failed : ", error as Error);

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        "Failed to delete OTP",
        500,
        false,
        ERROR_CODES.INTERNAL_ERROR
      );
    };
  };

};
