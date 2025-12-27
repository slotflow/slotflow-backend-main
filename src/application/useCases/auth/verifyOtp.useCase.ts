import { log } from '../../../shared/logger/logger';
import { Role } from '../../../domain/enums/role.enum';
import { OTPVerificationRequest } from '../../dtos/auth.dto';
import { IOTPService } from '../../../domain/interfaces/services/IOtpService.service';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUser.repository';
import { IProviderRepository } from '../../../domain/interfaces/repositories/IProvider.repository';

export class VerifyOTPUseCase {
  constructor(
    private userRepository: IUserRepository, 
    private providerRepository: IProviderRepository,
    private otpService: IOTPService
  ) { }

  async execute(payload: OTPVerificationRequest): Promise<void> {
    try {
      const { otp, verificationToken, role } = payload;
      if (!otp || !verificationToken || !role) throw new Error("Invalid request");

      const isValidOTP = await this.otpService.verifyOtp(verificationToken, otp);
      if (!isValidOTP) throw new Error("Invalid or expired OTP");

      if (role === Role.User) {
        const user = await this.userRepository.findByVerificationToken(verificationToken);
        if (!user) throw new Error("Verification failed");

        user.markEmailVerified();
        await this.userRepository.update(user);

      } else if (role === Role.Provider) {
        const provider = await this.providerRepository.findByVerificationToken(verificationToken);
        if (!provider) throw new Error("Verification failed");

        provider.markEmailVerified();
        await this.providerRepository.update(provider);

      } else {
        throw new Error("Unexpected error, please try again");
      }

    } catch (error) {
      log.error("VerifyOTPUseCase failed", error as Error);
      throw error;
    }
  }
}
