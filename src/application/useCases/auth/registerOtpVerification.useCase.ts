import mongoose from "mongoose";
import { Redis } from "@upstash/redis";
import { log } from "../../../shared/logger/logger";
import { createHmac, timingSafeEqual } from "node:crypto";
import { User } from "../../../domain/entities/user.entity";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { generateId } from "../../../shared/utils/helpers/generateId";
import { EventEnvelope, SendWelcomeEvent } from "../../dtos/kafka.dto";
import { ERROR_CODES, IdType } from "../../../shared/utils/types/enums";
import { appConfig, kafkaConfig, redisConfig } from "../../../config/env";
import { AppError, BadRequestError } from "../../../shared/error/appError";
import { CreditAccount } from "../../../domain/entities/creditAccount.entity";
import { PendingRegistration, RegisterOTPVerificationInput } from "../../dtos/auth.dto";
import { IKafkaProducerAdapter } from "../../interfaces/messaging/IKafkaProducer.adapter";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { ICreditAccountRepository } from "../../../domain/interfaces/repositories/ICreditAccount.repository";

export class RegisterOtpVerificationUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly kafkaProducer: IKafkaProducerAdapter,
    private readonly creditAccountRepository: ICreditAccountRepository,
    private readonly redisClient: Redis,
  ) {}

  async execute(input: RegisterOTPVerificationInput): Promise<void> {
    try {
      const { registrationId, otp } = input;

      if (!/^[a-f0-9]{64}$/.test(registrationId) || !/^[0-9]{6}$/.test(otp)) {
        throw new BadRequestError("Invalid registration or OTP");
      }

      const redisKey = `registration:pending:${registrationId}`;
      const attemptsKey = `registration:attempts:${registrationId}`;

      const pending = await this.redisClient.get<PendingRegistration>(redisKey);

      if (!pending) {
        throw new BadRequestError("Registration expired or invalid");
      }

      const attempts = await this.redisClient.incr(attemptsKey);

      if (attempts === 1) {
        await this.redisClient.expire(attemptsKey, redisConfig.redisOtpTtl);
      }

      if (attempts > 5) {
        throw new BadRequestError("Maximum OTP attempts exceeded");
      }

      const otpHash = createHmac("sha256", appConfig.otpHashSecret)
        .update(`${registrationId}:${otp}`)
        .digest();

      const storedHash = Buffer.from(pending.otpHash, "hex");

      const isValidOtp =
        storedHash.length === otpHash.length && timingSafeEqual(storedHash, otpHash);

      if (!isValidOtp) {
        throw new BadRequestError("Invalid OTP");
      }

      const registration = await this.redisClient.getdel<PendingRegistration>(redisKey);

      if (!registration) {
        throw new BadRequestError("Registration already verified or expired");
      }

      const { email, passwordHash, timeZone } = registration;

      if (!email || !passwordHash || !timeZone) {
        throw new BadRequestError("Invalid registration details");
      }

      const session = await mongoose.startSession();
      let newUser: User | null = null;

      try {
        session.startTransaction();

        const existingUser = await this.userRepository.findByEmail(email);

        if (existingUser) {
          throw new BadRequestError("User already exists", ERROR_CODES.INVALID_CREDENTIALS);
        }

        newUser = await this.userRepository.create(
          User.createLocal({
            username: email.split("@")[0].replace(/[^a-zA-Z]/g, ""),
            email,
            password: passwordHash,
            timeZone,
          }),
          session,
        );

        if (!newUser) {
          throw new AppError("Failed to create user", 500, true, ERROR_CODES.INTERNAL_ERROR);
        }

        const creditAccount = await this.creditAccountRepository.create(
          CreditAccount.create({
            userId: newUser._id,
          }),
          session,
        );

        if (!creditAccount) {
          throw new AppError(
            "Failed to create credit account",
            500,
            true,
            ERROR_CODES.INTERNAL_ERROR,
          );
        }

        await session.commitTransaction();
      } catch (error) {
        if (session.inTransaction()) {
          await session.abortTransaction();
        }
        throw error;
      } finally {
        await session.endSession();
      }

      await this.redisClient.del(attemptsKey).catch((error) => {
        log.error("Failed to clear OTP attempts", { error });
      });

      if (newUser) {
        try {
          await this.kafkaProducer.publish<EventEnvelope<SendWelcomeEvent>>(
            kafkaConfig.topics.pub.registerSuccess,
            {
              eventId: generateId({ type: IdType.EVENT }),
              attempt: 1,
              maxAttempts: 1,
              occurredAt: new Date(),
              payload: {
                emailData: {
                  email: newUser.email,
                },
              },
            },
          );
        } catch (error) {
          log.error("Failed to publish registration success event", { error });
        }
      }
    } catch (error: unknown) {
      throw toAppError(error, "Failed to verify OTP");
    }
  }
}
