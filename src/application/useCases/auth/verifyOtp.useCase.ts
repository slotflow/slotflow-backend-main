import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/common.enum";
import { User } from "../../../domain/entities/user.entity";
import { Provider } from "../../../domain/entities/provider.entity";
import { EventEnvelope, SendWelcomeEvent } from "../../dtos/kafka.dtos";
import { IOTPService } from "../../../domain/interfaces/services/IOtp.service";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { OTPVerificationRequest, VerifyAndActivateEntityRequest } from "../../dtos/auth.dto";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";

export class VerifyOTPUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly providerRepository: IProviderRepository,
    private readonly otpService: IOTPService,
    private readonly kafkaProducer: IKafkaProducerAdapter
  ) { };

  async execute(payload: OTPVerificationRequest): Promise<void> {
    try {
      const { otp, verificationToken, role } = payload;

      if (!otp || !verificationToken || !role) {
        throw new Error("Invalid request");
      };

      const isValidOTP = await this.otpService.verifyOtp(
        verificationToken,
        otp
      );

      if (!isValidOTP) {
        throw new Error("Invalid or expired OTP");
      };

      const entity = await this.verifyAndActivateEntity({
        role,
        verificationToken
      });

      await this.kafkaProducer.publish<EventEnvelope<SendWelcomeEvent>>(kafkaConfig.topics.pub.registerSuccess, {
        eventId: uuidv4(),
        attempt: 1,
        maxAttempts: 1,
        occurredAt: new Date().toISOString(),
        payload: {
          emailData: {
            email: entity.email,
            name: entity.username,
            role,
          },
        }
      });

    } catch (error) {
      log.error("VerifyOTPUseCase failed", error as Error);
      throw error;
    };
  };

  private async verifyAndActivateEntity(payload: VerifyAndActivateEntityRequest): Promise<User | Provider> {

    const { role, verificationToken } = payload;

    if (role === Role.USER) {
      const user = await this.userRepository.findByVerificationToken(verificationToken);

      if (!user) {
        throw new Error("Verification failed");
      };

      user.markEmailVerified();
      return this.userRepository.update(user);
    };

    if (role === Role.PROVIDER) {
      const provider = await this.providerRepository.findByVerificationToken(verificationToken);

      if (!provider) {
        throw new Error("Verification failed");
      };

      provider.markEmailVerified();
      return this.providerRepository.update(provider);
    };
    throw new Error("Unsupported role");
  };
};
