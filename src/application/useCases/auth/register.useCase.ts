import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from '../../../config/env';
import { log } from '../../../shared/logger/logger';
import { OtpPurpose } from '../../../domain/enums/common.enum';
import { IJWT } from '../../../domain/interfaces/security/IJwt';
import { EventEnvelope, SendOtpEvent } from '../../dtos/kafka.dtos';
import { RegisterRequest, RegisterResponse } from '../../dtos/auth.dto';
import { IOTPService } from '../../../domain/interfaces/services/IOtp.service';
import { IPasswordHasher } from '../../../domain/interfaces/security/IPasswordHasher';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUser.repository';
import { IKafkaProducerAdapter } from '../../../domain/interfaces/messaging/IKafkaProducerAdapter';

export class RegisterUseCase {

  constructor(
    private userRepository: IUserRepository,
    private otpService: IOTPService,
    private jwtService: IJWT,
    private passwordHasher: IPasswordHasher,
    private kafkaProducer: IKafkaProducerAdapter
  ) { };

  async execute(input: RegisterRequest): Promise<RegisterResponse> {
    try {
      const { username, email, password } = input;
      if (!username || !email || !password) throw new Error("Invalid request");

      const existUser = await this.userRepository.findByEmail(email);
      if (existUser) throw new Error("Email already exist.");

      const hashedPassword = await this.passwordHasher.hashPassword(password);

      const token = await this.jwtService.generateToken({ email, username, password: hashedPassword });

      const otp = await this.otpService.setOtp(email);
      if (!otp) throw new Error("Unexpected error, please try again.");

      await this.kafkaProducer.publish<EventEnvelope<SendOtpEvent>>(kafkaConfig.topics.pub.sendOtp, {
        eventId: uuidv4(),
        attempt: 1,
        maxAttempts: 1,
        occurredAt: new Date().toISOString(),
        payload: {
          emailData: {
            email,
            name: username,
            otp,
            purpose: OtpPurpose.REGISTRATION
          },
        }
      });

      return { token };
    }
    catch (error) {
      log.error("RegisterUseCase failed", error as Error);
      throw error;
    };
  };
};
