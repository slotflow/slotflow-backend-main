import { VerifyEmailInput, VerifyEmailOutput, PendingPasswordReset } from "../../dtos/auth.dto";
import { Redis } from "@upstash/redis";
import { IdType } from "../../../shared/utils/types/enums";
import { appConfig, kafkaConfig } from "../../../config/env";
import { OtpPurpose } from "../../../domain/enums/common.enum";
import { BadRequestError } from "../../../shared/error/appError";
import { createHmac, randomBytes, randomInt } from "node:crypto";
import { EventEnvelope, SendOtpEvent } from "../../dtos/kafka.dto";
import { generateId } from "../../../shared/utils/helpers/generateId";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { passwordRestConfig } from "../../../shared/utils/constants/constant";
import { IKafkaProducerAdapter } from "../../interfaces/messaging/IKafkaProducer.adapter";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";

export class VerifyEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly kafkaProducer: IKafkaProducerAdapter,
    private readonly redisClient: Redis,
  ) {}

  async execute(input: VerifyEmailInput): Promise<VerifyEmailOutput> {
    try {
      const { email } = input;

      if (!email) {
        throw new BadRequestError("Email is required");
      }

      const normalizedEmail = email.trim().toLowerCase();

      const user = await this.userRepository.findByEmail(normalizedEmail);

      const resetRequestId = randomBytes(32).toString("hex");

      if (!user || user.isBlocked) {
        return { resetRequestId };
      }

      const otp = randomInt(100000, 1000000).toString();

      const otpHash = createHmac("sha256", appConfig.otpHashSecret)
        .update(`${resetRequestId}:${otp}`)
        .digest("hex");

      const pendingReset: PendingPasswordReset = {
        userId: String(user._id),
        email: user.email,
        otpHash,
      };

      await this.redisClient.set(`password-reset:otp:${resetRequestId}`, pendingReset, {
        ex: passwordRestConfig.otpTTL,
      });

      await this.redisClient.set(`password-reset:attempts:${resetRequestId}`, 0, {
        ex: passwordRestConfig.otpTTL,
      });

      await this.kafkaProducer.publish<EventEnvelope<SendOtpEvent>>(
        kafkaConfig.topics.pub.sendOtp,
        {
          eventId: generateId({ type: IdType.EVENT }),
          attempt: 1,
          maxAttempts: 1,
          occurredAt: new Date(),
          payload: {
            emailData: {
              email: user.email,
              otp,
              purpose: OtpPurpose.PASSWORD_RESET,
            },
          },
        },
      );

      return { resetRequestId };
    } catch (error: unknown) {
      throw toAppError(error, "Failed to send password reset OTP");
    }
  }
}
