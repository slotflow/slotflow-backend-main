import { Redis } from "@upstash/redis";
import { createHmac } from "node:crypto";
import { generateOTP } from "otp-generator-module";
import { IdType } from "../../../shared/utils/types/enums";
import { appConfig, kafkaConfig } from "../../../config/env";
import { OtpPurpose } from "../../../domain/enums/common.enum";
import { BadRequestError } from "../../../shared/error/appError";
import { EventEnvelope, SendOtpEvent } from "../../dtos/kafka.dto";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { generateId } from "../../../shared/utils/helpers/generateId";
import { PendingRegistration, ResendOtpOutput } from "../../dtos/auth.dto";
import { IKafkaProducerAdapter } from "../../interfaces/messaging/IKafkaProducer.adapter";

export class ResendOtpUseCase {
  constructor(
    private readonly kafkaProducer: IKafkaProducerAdapter,
    private readonly redisClient: Redis,
  ) {}

  async execute(input: ResendOtpOutput): Promise<void> {
    try {
      const { registrationId } = input;

      if (!registrationId || !/^[a-f0-9]{64}$/.test(registrationId)) {
        throw new BadRequestError("Invalid registration session");
      }

      const redisKey = `registration:pending:${registrationId}`;
      const cooldownKey = `registration:resend:cooldown:${registrationId}`;
      const countKey = `registration:resend:count:${registrationId}`;

      const pending = await this.redisClient.get<PendingRegistration>(redisKey);

      if (!pending) {
        throw new BadRequestError("Registration expired. Please register again.");
      }

      const cooldown = await this.redisClient.set(cooldownKey, "1", { nx: true, ex: 60 });

      if (cooldown !== "OK") {
        throw new BadRequestError("Please wait before requesting another OTP");
      }

      const resendCount = await this.redisClient.incr(countKey);

      if (resendCount === 1) {
        const ttl = await this.redisClient.ttl(redisKey);
        if (ttl > 0) {
          await this.redisClient.expire(countKey, ttl);
        }
      }

      if (resendCount > 3) {
        throw new BadRequestError("Maximum OTP resend limit exceeded");
      }

      const otp = generateOTP({ length: 6 });

      const otpHash = createHmac("sha256", appConfig.otpHashSecret)
        .update(`${registrationId}:${otp}`)
        .digest("hex");

      const updatedRegistration: PendingRegistration = {
        ...pending,
        otpHash,
      };

      const updated = await this.redisClient.set(redisKey, updatedRegistration, {
        xx: true,
        keepTtl: true,
      });

      if (updated !== "OK") {
        throw new BadRequestError("Registration expired. Please register again.");
      }

      await this.kafkaProducer.publish<EventEnvelope<SendOtpEvent>>(
        kafkaConfig.topics.pub.sendOtp,
        {
          eventId: generateId({ type: IdType.EVENT }),
          attempt: 1,
          maxAttempts: 1,
          occurredAt: new Date(),
          payload: {
            emailData: {
              email: pending.email,
              otp,
              purpose: OtpPurpose.REGISTRATION,
            },
          },
        },
      );
    } catch (error: unknown) {
      throw toAppError(error, "Failed to resend OTP");
    }
  }
}
