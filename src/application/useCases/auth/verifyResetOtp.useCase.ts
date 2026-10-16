import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import {
  PendingPasswordReset,
  PasswordResetGrant,
  VerifyResetOtpInput,
  VerifyResetOtpOutput,
} from "../../dtos/auth.dto";
import { Redis } from "@upstash/redis";
import { appConfig } from "../../../config/env";
import { BadRequestError } from "../../../shared/error/appError";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { passwordRestConfig } from "../../../shared/utils/constants/constant";

export class VerifyResetOtpUseCase {
  constructor(private readonly redisClient: Redis) {}

  async execute(input: VerifyResetOtpInput): Promise<VerifyResetOtpOutput> {
    try {
      const { resetRequestId, otp } = input;

      if (!/^[a-f0-9]{64}$/.test(resetRequestId) || !/^[0-9]{6}$/.test(otp)) {
        throw new BadRequestError("Invalid reset session or OTP");
      }

      const redisKey = `password-reset:otp:${resetRequestId}`;
      const attemptsKey = `password-reset:attempts:${resetRequestId}`;

      const pending = await this.redisClient.get<PendingPasswordReset>(redisKey);

      if (!pending) {
        throw new BadRequestError("OTP expired or invalid");
      }

      const attempts = await this.redisClient.incr(attemptsKey);

      if (attempts > passwordRestConfig.maxAttempts) {
        throw new BadRequestError("Maximum OTP attempts exceeded");
      }

      const expectedHash = createHmac("sha256", appConfig.otpHashSecret)
        .update(`${resetRequestId}:${otp}`)
        .digest();

      const storedHash = Buffer.from(pending.otpHash, "hex");

      const isValidOtp =
        storedHash.length === expectedHash.length && timingSafeEqual(storedHash, expectedHash);

      if (!isValidOtp) {
        throw new BadRequestError("Invalid OTP");
      }

      const verified = await this.redisClient.getdel<PendingPasswordReset>(redisKey);

      if (!verified) {
        throw new BadRequestError("OTP already verified or expired");
      }

      await this.redisClient.del(attemptsKey);

      const resetGrant = randomBytes(32).toString("hex");

      const grantData: PasswordResetGrant = {
        userId: verified.userId,
      };

      await this.redisClient.set(`password-reset:grant:${resetGrant}`, grantData, {
        ex: passwordRestConfig.grantTTL,
      });

      return { resetGrant };
    } catch (error: unknown) {
      throw toAppError(error, "Failed to verify reset OTP");
    }
  }
}
