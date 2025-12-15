import { v4 as uuidv4 } from 'uuid';
import { producer } from '../../../server';
import { kafkaConfig } from '../../../config/env';
import { roleArray } from '../../../shared/utils/constants';
import { User } from '../../../domain/entities/user.entity';
import { JWTService } from '../../../infrastructure/security/jwt';
import { Provider } from '../../../domain/entities/provider.entity';
import { OTPService } from '../../../infrastructure/services/otp.service';
import { PasswordHasher } from '../../../infrastructure/security/password-hashing';
import { RegisterRequest, RegisterResponse } from '../../../infrastructure/dtos/auth.dto';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUser.repository';
import { IProviderRepository } from '../../../domain/interfaces/repositories/IProvider.repository';

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
        userOrProvider = await this.userRepository.findUserByEmail(email);
        if (userOrProvider?.isEmailVerified) throw new Error("Email already exist.");
      } else if (role === roleArray[2]) {
        userOrProvider = await this.providerRepository.findProviderByEmail(email);
        if (userOrProvider?.isEmailVerified) throw new Error("Email already exist.");
      } else {
        throw new Error("Invalid request.");
      }

      const hashedPassword = await PasswordHasher.hashPassword(password);

      const verificationToken = uuidv4();
      if (!verificationToken) throw new Error("Unexpected error, please try again.");

      const otp = await OTPService.setOtp(verificationToken);
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

      if (userOrProvider) {
        userOrProvider.verificationToken = verificationToken;
        userOrProvider.password = hashedPassword;
        if (role === roleArray[1]) {
          await this.userRepository.updateUser(userOrProvider as User);
        } else if (role === roleArray[2]) {
          await this.providerRepository.updateProvider(userOrProvider as Provider);
        }
      } else {
        if (role === roleArray[1]) {
          await this.userRepository.createUser({
            username: username,
            email: email,
            password: hashedPassword,
            verificationToken: verificationToken,
          });
        } else if (role === roleArray[2]) {
          await this.providerRepository.createProvider({
            username: username,
            email: email,
            password: hashedPassword,
            verificationToken: verificationToken
          });
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
