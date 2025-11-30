import { producer } from '../../server';
import { kafkaConfig } from '../../config/env';
import { User } from '../../domain/entities/user.entity';
import { Provider } from '../../domain/entities/provider.entity';
import { roleArray } from '../../infrastructure/helpers/constants';
import { OTPService } from '../../infrastructure/services/otp.service';
import { ResendOtpRequest, ResendOtpResponse } from '../../infrastructure/dtos/auth.dto';
import { UserRepositoryImpl } from '../../infrastructure/database/user/user.repository.impl';
import { ProviderRepositoryImpl } from '../../infrastructure/database/provider/provider.repository.impl';

export class ResendOtpUseCase {

  constructor(
    private userRepositoryImpl: UserRepositoryImpl,
    private providerRepositoryImpl: ProviderRepositoryImpl,
  ) { }

  async execute(payload: ResendOtpRequest): Promise<ResendOtpResponse> {
    try {
      const { role, verificationToken, email } = payload;
      if (!role || (!verificationToken && !email)) throw new Error("Invalid request.");

      let userOrProvider: Provider | User | null = null;

      if (email && role) {
        if (role === roleArray[1]) {
          userOrProvider = await this.userRepositoryImpl.findUserByEmail(email);
        } else if (role === roleArray[2]) {
          userOrProvider = await this.providerRepositoryImpl.findProviderByEmail(email);
        } else {
          throw new Error("Invalid request.");
        }

      } else if (verificationToken && role) {
        if (role === roleArray[1]) {
          userOrProvider = await this.userRepositoryImpl.findUserByVerificationToken(verificationToken);
        } else if (role === roleArray[2]) {
          userOrProvider = await this.providerRepositoryImpl.findProviderByVerificationToken(verificationToken);
        } else {
          throw new Error("Invalid request.");
        }
      }

      if (!userOrProvider || !userOrProvider?.email || !userOrProvider?.verificationToken) throw new Error("Please register.")

      const otp = await OTPService.setOtp(userOrProvider?.verificationToken);
      if (!otp) throw new Error("Unexpected error, please try again.");

      await producer.send({
        topic: kafkaConfig.otpSendTopic,
        messages: [{
          key: email,
          value: JSON.stringify({
            otp,
            email,
            contentNumber: 1
          })
        }],
      });

      return { success: true, message: `OTP sent to email.`, authUser: { verificationToken: userOrProvider.verificationToken, role } };
    } catch (error) {
      console.log("ResendOtpUseCase error : ", error);
      throw new Error("Failed to resend OTP");
    }
  }
}
