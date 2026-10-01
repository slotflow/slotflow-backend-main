import { kafkaConfig } from '../../../config/env';
import { IJWT } from '../../interfaces/security/IJwt.service';
import { OtpPurpose } from '../../../domain/enums/common.enum';
import { BadRequestError } from '../../../shared/error/appError';
import { EventEnvelope, SendOtpEvent } from '../../dtos/kafka.dto';
import { RegisterInput, RegisterOutput } from '../../dtos/auth.dto';
import { IOTPService } from '../../interfaces/services/IOtp.service';
import { generateId } from '../../../shared/utils/helpers/generateId';
import { toAppError } from '../../../shared/error/handleUnknownError';
import { ERROR_CODES, IdType } from '../../../shared/utils/types/enums';
import { IPasswordHasher } from '../../interfaces/security/IPasswordHasher.service';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUser.repository';
import { IKafkaProducerAdapter } from '../../interfaces/messaging/IKafkaProducer.adapter';

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
      const { email, password, timeZone } = input;
      if (!email || !password || !timeZone) {
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

      const token = await this.jwtService.generateToken({ 
        email, 
        password: hashedPassword,
        timeZone
      });

      const otp = await this.otpService.setOtp(email);

      await this.kafkaProducer.publish<EventEnvelope<SendOtpEvent>>(kafkaConfig.topics.pub.sendOtp, {
        eventId: generateId({ type: IdType.EVENT }),
        attempt: 1,
        maxAttempts: 1,
        occurredAt: new Date(),
        payload: {
          emailData: {
            email,
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
