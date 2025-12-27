import { v4 as uuidv4 } from 'uuid';
// import { producer } from '../../../server';
import { log } from '../../../shared/logger/logger';
// import { kafkaConfig } from '../../../config/env';
import { Role } from '../../../domain/enums/role.enum';
import { User } from '../../../domain/entities/user.entity';
import { JWTService } from '../../../infrastructure/security/jwt';
import { Provider } from '../../../domain/entities/provider.entity';
import { RegisterRequest, RegisterResponse } from '../../dtos/auth.dto';
import { PasswordHasher } from '../../../infrastructure/security/password-hashing';
import { IOTPService } from '../../../domain/interfaces/services/IOtpService.service';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUser.repository';
import { IProviderRepository } from '../../../domain/interfaces/repositories/IProvider.repository';

export class RegisterUseCase {

  constructor(
    private userRepository: IUserRepository,
    private providerRepository: IProviderRepository,
    private otpService: IOTPService
  ) { }

  async execute(payload: RegisterRequest): Promise<RegisterResponse> {
    try {
      const { username, email, password, role } = payload;
      if (!username || !email || !password || !role) throw new Error("Invalid request");

      if (role === Role.User) {
        const user = await this.userRepository.findByEmail(email);
        if (user && user.isEmailVerified) throw new Error("Email already exist.");

        const hashedPassword = await PasswordHasher.hashPassword(password);

        const verificationToken = uuidv4();
        if (!verificationToken) throw new Error("Unexpected error, please try again.");

        const otp = await this.otpService.setOtp(verificationToken);
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
        if (user) {
          user.changePassword({ verificationToken, password: hashedPassword });
          await this.userRepository.update(user);
        } else {
          const user = User.createLocal({
            username,
            email,
            password: hashedPassword,
            verificationToken,
          });
          await this.userRepository.create(user);
        }

        const token = JWTService.generateToken({ email, role });

        return {
          authUser: {
            verificationToken,
            role,
            token
          }
        };

      } else if (role === Role.Provider) {
        const provider = await this.providerRepository.findByEmail(email);
        if (provider && provider.isEmailVerified) throw new Error("Email already exist.");

        const hashedPassword = await PasswordHasher.hashPassword(password);

        const verificationToken = uuidv4();
        if (!verificationToken) throw new Error("Unexpected error, please try again.");

        const otp = await this.otpService.setOtp(verificationToken);
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

        if (provider) {
          provider.changePassword({ verificationToken, password: hashedPassword });
          await this.providerRepository.update(provider);
        } else {
          const provider = Provider.createLocal({
            username,
            email,
            password: hashedPassword,
            verificationToken,
          });
          await this.providerRepository.create(provider);
        }

        const token = JWTService.generateToken({ email, role });

        return {
          authUser: {
            verificationToken,
            role,
            token
          }
        };

      } else {
        throw new Error("Invalid request.");
      }

    } catch (error) {
      log.error("RegisterUseCase failed", error as Error);
      throw error;
    }
  }
}
