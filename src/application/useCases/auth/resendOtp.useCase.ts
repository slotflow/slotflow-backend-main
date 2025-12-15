// import { producer } from '../../../server';
import { kafkaConfig } from '../../../config/env';
import { User } from '../../../domain/entities/user.entity';
import { roleArray } from '../../../shared/utils/constants';
import { Provider } from '../../../domain/entities/provider.entity';
import { OTPService } from '../../../infrastructure/services/otp.service';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUser.repository';
import { ResendOtpRequest, ResendOtpResponse } from '../../../infrastructure/dtos/auth.dto';
import { IProviderRepository } from '../../../domain/interfaces/repositories/IProvider.repository';

export class ResendOtpUseCase {

  constructor(
    private userRepository: IUserRepository,
    private providerRepository: IProviderRepository,
  ) { }

  async execute(payload: ResendOtpRequest): Promise<ResendOtpResponse> {
    try {
      const { role, verificationToken, email } = payload;
      if (!role || (!verificationToken && !email)) throw new Error("Invalid request.");

      let userOrProvider: Provider | User | null = null;

      if (email && role) {
        if (role === roleArray[1]) {
          userOrProvider = await this.userRepository.findUserByEmail(email);
        } else if (role === roleArray[2]) {
          userOrProvider = await this.providerRepository.findProviderByEmail(email);
        } else {
          throw new Error("Invalid request.");
        }

      } else if (verificationToken && role) {
        if (role === roleArray[1]) {
          userOrProvider = await this.userRepository.findUserByVerificationToken(verificationToken);
        } else if (role === roleArray[2]) {
          userOrProvider = await this.providerRepository.findProviderByVerificationToken(verificationToken);
        } else {
          throw new Error("Invalid request.");
        }
      }

      if (!userOrProvider || !userOrProvider?.email || !userOrProvider?.verificationToken) throw new Error("Please register.")

      const otp = await OTPService.setOtp(userOrProvider?.verificationToken);
      if (!otp) throw new Error("Unexpected error, please try again.");

      // await producer.send({
      //   topic: kafkaConfig.otpSendTopic,
      //   messages: [{
      //     key: email,
      //     value: JSON.stringify({
      //       otp,
      //       email,
      //       contentNumber: 1
      //     })
      //   }],
      // });

      return { success: true, message: `OTP has been sent to your email`, authUser: { verificationToken: userOrProvider.verificationToken, role } };
    } catch (error) {
      console.log("ResendOtpUseCase error : ", error);
      throw new Error("Failed to resend OTP");
    }
  }
}
