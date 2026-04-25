import { kafkaConfig } from '../../../config/env';
import { generateId } from '../../../shared/utils/generateId';
import { OtpPurpose } from '../../../domain/enums/common.enum';
import { IJWT } from '../../../domain/interfaces/security/IJwt';
import { BadRequestError } from '../../../shared/error/appError';
import { ERROR_CODES, IdType } from '../../../shared/utils/types';
import { EventEnvelope, SendOtpEvent } from '../../dtos/kafka.dto';
import { RegisterInput, RegisterOutput } from '../../dtos/auth.dto';
import { toAppError } from '../../../shared/error/handleUnknownError';
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

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    try {
      const { username, email, password } = input;
      if (!username || !email || !password) {
        throw new BadRequestError()
      }

      const existUser = await this.userRepository.findByEmail(email);
      if (existUser) {
        throw new BadRequestError(
          "Invalid credentials",
          ERROR_CODES.INVALID_CREDENTIALS
        );
      }

      const hashedPassword = await this.passwordHasher.hashPassword(password);

      const token = await this.jwtService.generateToken({ email, username, password: hashedPassword });

      const otp = await this.otpService.setOtp(email);

      await this.kafkaProducer.publish<EventEnvelope<SendOtpEvent>>(kafkaConfig.topics.pub.sendOtp, {
        eventId: generateId(IdType.EVENT),
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
    catch (error: unknown) {
      throw toAppError(error, "Failed to create account");
    };
  };
};
