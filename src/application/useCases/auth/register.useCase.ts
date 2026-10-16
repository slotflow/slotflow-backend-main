import { Redis } from "@upstash/redis";
import { createHmac, randomBytes } from "crypto";
import { generateOTP } from "otp-generator-module";
import { OtpPurpose } from "../../../domain/enums/common.enum";
import { BadRequestError } from "../../../shared/error/appError";
import { EventEnvelope, SendOtpEvent } from "../../dtos/kafka.dto";
import { generateId } from "../../../shared/utils/helpers/generateId";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { ERROR_CODES, IdType } from "../../../shared/utils/types/enums";
import { appConfig, kafkaConfig, redisConfig } from "../../../config/env";
import { IPasswordHasher } from "../../interfaces/security/IPasswordHasher.service";
import { PendingRegistration, RegisterInput, RegisterOutput } from "../../dtos/auth.dto";
import { IKafkaProducerAdapter } from "../../interfaces/messaging/IKafkaProducer.adapter";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";

export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly kafkaProducer: IKafkaProducerAdapter,
    private readonly redisClient: Redis,
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    try {
      const { email, password, timeZone } = input;
      if (!email || !password || !timeZone) {
        throw new BadRequestError();
      }

      const normalizedEmail = email.trim().toLowerCase();

      const existUser = await this.userRepository.findByEmail(normalizedEmail);
      if (existUser) {
        throw new BadRequestError("Invalid credentials", ERROR_CODES.INVALID_CREDENTIALS);
      }

      const passwordHash = await this.passwordHasher.hashPassword(password);

      const otp = generateOTP({ length: 6 });

      const registrationId = randomBytes(32).toString("hex");

      const otpHash = createHmac("sha256", appConfig.otpHashSecret)
        .update(`${registrationId}:${otp}`)
        .digest("hex");

      const pendingRegistration: PendingRegistration = {
        email: normalizedEmail,
        passwordHash,
        timeZone,
        otpHash,
      };

      await this.redisClient.set(`registration:pending:${registrationId}`, pendingRegistration, {
        ex: redisConfig.redisOtpTtl,
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
              email,
              otp,
              purpose: OtpPurpose.REGISTRATION,
            },
          },
        },
      );

      return {
        registrationId,
      };
    } catch (error: unknown) {
      throw toAppError(error, "Failed to create account");
    }
  }
}
