import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/role.enum";
import { User } from "../../../domain/entities/user.entity";
import { Provider } from "../../../domain/entities/provider.entity";
import { IKafkaService } from "../../../domain/interfaces/services/IKafka.service";
import { IOTPService } from "../../../domain/interfaces/services/IOtpService.service";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { OTPVerificationRequest, VerifyAndActivateEntityRequest } from "../../dtos/auth.dto";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";

export class VerifyOTPUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly providerRepository: IProviderRepository,
    private readonly otpService: IOTPService,
    private readonly kafkaService: IKafkaService
  ) {};

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

      await this.kafkaService.send({
        topic: kafkaConfig.topics.registerSuccess,
        key: entity.email,
        message: {
          name: entity.username,
          email: entity.email,
          contentNumber: 1,
        },
      });

    } catch (error) {
      log.error("VerifyOTPUseCase failed", error as Error);
      throw error;
    };
  };

  private async verifyAndActivateEntity(payload: VerifyAndActivateEntityRequest): Promise<User | Provider> {

    const { role, verificationToken } = payload;

    if (role === Role.User) {
      const user = await this.userRepository.findByVerificationToken(
        verificationToken
      );

      if (!user) {
        throw new Error("Verification failed");
      };

      user.markEmailVerified();
      return this.userRepository.update(user);
    };

    if (role === Role.Provider) {
      const provider =
        await this.providerRepository.findByVerificationToken(
          verificationToken
        );

      if (!provider) {
        throw new Error("Verification failed");
      };

      provider.markEmailVerified();
      return this.providerRepository.update(provider);
    };
    throw new Error("Unsupported role");
  };
};
