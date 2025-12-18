import { roleArray } from '../../../shared/utils/constants';
import { ApiResponse } from '../../dtos/common.dto';
import { OTPService } from '../../../infrastructure/services/otp.service';
import { OTPVerificationRequest } from '../../dtos/auth.dto';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUser.repository';
import { IProviderRepository } from '../../../domain/interfaces/repositories/IProvider.repository';

export class VerifyOTPUseCase {
  constructor(
    private userRepository: IUserRepository, 
    private providerRepository: IProviderRepository
  ) { }

  async execute(payload: OTPVerificationRequest): Promise<ApiResponse> {
    try {
      const { otp, verificationToken, role } = payload;
      if (!otp || !verificationToken || !role) throw new Error("Invalid request.");

      const isValidOTP = await OTPService.verifyOTP(verificationToken, otp);
      if (!isValidOTP) throw new Error("Invalid or expired OTP.");

      if (role === roleArray[1]) {
        const user = await this.userRepository.findUserByVerificationToken(verificationToken);
        if (!user) throw new Error("Verification failed");

        user.isEmailVerified = true;
        await this.userRepository.updateUser(user);

      } else if (role === roleArray[2]) {
        const provider = await this.providerRepository.findByVerificationToken(verificationToken);
        if (!provider) throw new Error("Verification failed");

        provider.markEmailVerified();
        const updatedProvider = await this.providerRepository.update(provider);
        if (!updatedProvider) throw new Error("Unexpected error, please try again.");

      } else {
        throw new Error("Unexpected error, please try again.");
      }

      return { success: true, message: 'OTP verified successfully.' };
    } catch (error) {
      console.log("VerifyOTPUseCase error : ", error);
      throw new Error("Failed to verify OTP");
    }
  }
}
