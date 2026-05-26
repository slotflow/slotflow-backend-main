import mongoose from "mongoose";
import { kafkaConfig } from "../../../config/env";
import { OTPVerificationInput } from "../../dtos/auth.dto";
import { User } from "../../../domain/entities/user.entity";
import { generateId } from '../../../shared/utils/generateId';
import { IJWT } from '../../../domain/interfaces/security/IJwt';
import { ERROR_CODES, IdType } from '../../../shared/utils/types';
import { toAppError } from '../../../shared/error/handleUnknownError';
import { EventEnvelope, SendWelcomeEvent } from "../../dtos/kafka.dto";
import { AppError, BadRequestError } from '../../../shared/error/appError';
import { CreditAccount } from "../../../domain/entities/creditAccount.entity";
import { IOTPService } from "../../../domain/interfaces/services/IOtp.service";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { ICreditAccountRepository } from "../../../domain/interfaces/repositories/ICreditAccount.repository";

export class VerifyOTPUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpService: IOTPService,
    private readonly kafkaProducer: IKafkaProducerAdapter,
    private readonly jwtService: IJWT,
    private readonly creditAccountRepository: ICreditAccountRepository
  ) { };

  async execute(input: OTPVerificationInput): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { token, otp } = input;
      if (!token || !otp) {
        throw new BadRequestError();
      }

      const { email, username, password } = await this.jwtService.verifyToken(token);
      if (!email || !username || !password) {
        throw new BadRequestError();
      }

      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new BadRequestError(
          "Invalid credentials",
          ERROR_CODES.INVALID_CREDENTIALS
        );
      }

      const isValidOTP = await this.otpService.verifyOtp(email, otp);
      if (!isValidOTP) throw new BadRequestError("Invalid OTP");

      const referralCode = generateId({
        type: IdType.REFERRAL,
        options: { name: username }
      });

      if (!existingUser) {
        const newUser = await this.userRepository.create(User.createLocal({
          email,
          username,
          password,
          referralCode
        }), session);

        if (!newUser) {
          throw new AppError(
            "Internal server error",
            500,
            true,
            ERROR_CODES.INTERNAL_ERROR
          )
        };

        const creditAccount = await this.creditAccountRepository.create(CreditAccount.create({
          userId: newUser._id
        }), session);
        if (!creditAccount) {
          throw new AppError(
            "Internal server error",
            500,
            true,
            ERROR_CODES.INTERNAL_ERROR
          )
        }

        await this.kafkaProducer.publish<EventEnvelope<SendWelcomeEvent>>(kafkaConfig.topics.pub.registerSuccess, {
          eventId: generateId({ type: IdType.EVENT }),
          attempt: 1,
          maxAttempts: 1,
          occurredAt: new Date().toISOString(),
          payload: {
            emailData: {
              email: newUser.email,
              name: newUser.username,
              role: newUser.role,
            },
          }
        })
      }
      await session.commitTransaction();
    } catch (error: unknown) {
      await session.abortTransaction();
      throw toAppError(error, "Failed to verify otp");
    } finally {
      session.endSession();
    }
  }
}
