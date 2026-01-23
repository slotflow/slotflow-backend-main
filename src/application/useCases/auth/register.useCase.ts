import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from '../../../config/env';
import { log } from '../../../shared/logger/logger';
import { SendOtpEvent } from '../../dtos/kafka.dtos';
import { User } from '../../../domain/entities/user.entity';
import { IJWT } from '../../../domain/interfaces/security/IJwt';
import { Provider } from '../../../domain/entities/provider.entity';
import { RegisterRequest, RegisterResponse } from '../../dtos/auth.dto';
import { IOTPService } from '../../../domain/interfaces/services/IOtp.service';
import { IPasswordHasher } from '../../../domain/interfaces/security/IPasswordHasher';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUser.repository';
import { IKafkaProducerAdapter } from '../../../domain/interfaces/message/IKafkaProducerAdapter';
import { IProviderRepository } from '../../../domain/interfaces/repositories/IProvider.repository';
import { OtpPurpose, Role } from '../../../domain/enums/common.enum';

// CAN OPTIMISE ( REDUCE SAME TYPE OF CODE )

export class RegisterUseCase {

  constructor(
    private userRepository: IUserRepository,
    private providerRepository: IProviderRepository,
    private otpService: IOTPService,
    private jwtService: IJWT,
    private passwordHasher: IPasswordHasher,
    private kafkaProducer: IKafkaProducerAdapter
  ) { };

  async execute(payload: RegisterRequest): Promise<RegisterResponse> {
    try {
      const { username, email, password, role } = payload;
      if (!username || !email || !password || !role) throw new Error("Invalid request");

      if (role === Role.USER) {
        const user = await this.userRepository.findByEmail(email);
        if (user && user.isEmailVerified) throw new Error("Email already exist.");

        const hashedPassword = await this.passwordHasher.hashPassword(password);

        const verificationToken = uuidv4();
        if (!verificationToken) throw new Error("Unexpected error, please try again.");

        const otp = await this.otpService.setOtp(verificationToken);
        if (!otp) throw new Error("Unexpected error, please try again.");

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
        };

        const token = await this.jwtService.generateToken({ email, role });

        await this.kafkaProducer.publish<SendOtpEvent>(kafkaConfig.topics.pub.sendOtp, {
          email,
          name: username,
          otp,
          purpose: OtpPurpose.REGISTRATION
        });

        return {
          authUser: {
            verificationToken,
            role,
            token
          },
        };

      } else if (role === Role.PROVIDER) {
        const provider = await this.providerRepository.findByEmail(email);
        if (provider && provider.isEmailVerified) throw new Error("Email already exist.");

        const hashedPassword = await this.passwordHasher.hashPassword(password);

        const verificationToken = uuidv4();
        if (!verificationToken) throw new Error("Unexpected error, please try again.");

        const otp = await this.otpService.setOtp(verificationToken);
        if (!otp) throw new Error("Unexpected error, please try again.");

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
        };

        const token = await this.jwtService.generateToken({ email, role });

        await this.kafkaProducer.publish<SendOtpEvent>(kafkaConfig.topics.pub.sendOtp, {
          email,
          name: username,
          otp,
          purpose: OtpPurpose.REGISTRATION
        });

        return {
          authUser: {
            verificationToken,
            role,
            token
          },
        };

      } else {
        throw new Error("Invalid request.");
      };

    } catch (error) {
      log.error("RegisterUseCase failed", error as Error);
      throw error;
    };
  };
};
