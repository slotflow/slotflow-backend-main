// import { producer } from '../../../server';
// import { kafkaConfig } from '../../../config/env';
import { log } from '../../../shared/logger/logger';
import { Role } from '../../../domain/enums/role.enum';
import { User } from '../../../domain/entities/user.entity';
import { Provider } from '../../../domain/entities/provider.entity';
import { ResendOtpRequest, ResendOtpResponse } from '../../dtos/auth.dto';
import { IOTPService } from '../../../domain/interfaces/services/IOtpService.service';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUser.repository';
import { IProviderRepository } from '../../../domain/interfaces/repositories/IProvider.repository';

export class ResendOtpUseCase {

  constructor(
    private userRepository: IUserRepository,
    private providerRepository: IProviderRepository,
    private otpService: IOTPService
  ) { }

  async execute(payload: ResendOtpRequest): Promise<ResendOtpResponse> {
    try {
      const { role, verificationToken, email } = payload;
      if (!role || (!verificationToken && !email)) throw new Error("Invalid request.");

      let userOrProvider: Provider | User | null = null;

      if (email && role) {
        if (role === Role.User) {
          userOrProvider = await this.userRepository.findByEmail(email);
        } else if (role === Role.Provider) {
          userOrProvider = await this.providerRepository.findByEmail(email);
        } else {
          throw new Error("Invalid request.");
        }

      } else if (verificationToken && role) {
        if (role === Role.User) {
          userOrProvider = await this.userRepository.findByVerificationToken(verificationToken);
        } else if (role === Role.Provider) {
          userOrProvider = await this.providerRepository.findByVerificationToken(verificationToken);
        } else {
          throw new Error("Invalid request.");
        }
      }

      if (!userOrProvider || !userOrProvider?.email || !userOrProvider?.verificationToken) throw new Error("Please register.")

      const otp = await this.otpService.setOtp(userOrProvider?.verificationToken);
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

      return { authUser: { verificationToken: userOrProvider.verificationToken, role } };
    } catch (error) {
      log.error("ResendOtpUseCase failed", error as Error);
      throw error;
    }
  }
}
