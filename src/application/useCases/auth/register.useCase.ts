import { v4 as uuidv4 } from 'uuid';
// import { producer } from '../../../server';
// import { kafkaConfig } from '../../../config/env';
import { roleArray } from '../../../shared/utils/constants';
import { JWTService } from '../../../infrastructure/security/jwt';
import { RegisterRequest, RegisterResponse } from '../../dtos/auth.dto';
import { OTPService } from '../../../infrastructure/services/otp.service';
import { PasswordHasher } from '../../../infrastructure/security/password-hashing';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUser.repository';
import { IProviderRepository } from '../../../domain/interfaces/repositories/IProvider.repository';
import { Provider, User } from '../../dtos/common.dto';

// TODO try to avoid userOrProvider with onlu user or provider
export class RegisterUseCase {

  constructor(
    private userRepository: IUserRepository,
    private providerRepository: IProviderRepository,
  ) { }

  async execute(payload: RegisterRequest): Promise<RegisterResponse> {
    try {
      const { username, email, password, role } = payload;
      if (!username || !email || !password || !role) throw new Error("Invalid request");

      let userOrProvider: Partial<Provider> | Partial<User> | null;

      if (role === roleArray[1]) {
        userOrProvider = await this.userRepository.findByEmail(email);
        if ((userOrProvider as User)?.isEmailVerified) throw new Error("Email already exist.");
      } else if (role === roleArray[2]) {
        userOrProvider = await this.providerRepository.findByEmail(email);
        if ((userOrProvider as Provider)?.isEmailVerified) throw new Error("Email already exist.");
      } else {
        throw new Error("Invalid request.");
      }

      const hashedPassword = await PasswordHasher.hashPassword(password);

      const verificationToken = uuidv4();
      if (!verificationToken) throw new Error("Unexpected error, please try again.");

      const otp = await OTPService.setOtp(verificationToken);
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

      if (userOrProvider) {
        if (role === roleArray[1]) {
          (userOrProvider as User).changePassword({ verificationToken, password: hashedPassword });
          await this.userRepository.update(userOrProvider as User);
        } else if (role === roleArray[2]) {
          (userOrProvider as Provider).changePassword({verificationToken, password: hashedPassword});
          await this.providerRepository.update(userOrProvider as Provider);
        }
      } else {
        if (role === roleArray[1]) {
          const user = User.createLocal({
               _id: "",
            username,
            email,
            password: hashedPassword,
            verificationToken,
          });
          await this.userRepository.create(user);
        } else if (role === roleArray[2]) {
          const provider = Provider.createLocal({
            _id: "",
            username,
            email,
            password: hashedPassword,
            verificationToken,
          });
          await this.providerRepository.create(provider);
        }
      }

      const token = JWTService.generateToken({ email, role });

      return { success: true, message: `OTP has been sent to your email`, authUser: { verificationToken, role, token } };
    } catch (error) {
      console.log("RegisterUseCase error : ", error);
      throw new Error("Failed to register");
    }
  }
}
