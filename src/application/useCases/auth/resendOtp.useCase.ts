import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from '../../../config/env';
import { ResendOtpOutput } from '../../dtos/auth.dto';
import { ERROR_CODES } from '../../../shared/utils/types';
import { OtpPurpose } from '../../../domain/enums/common.enum';
import { IJWT } from '../../../domain/interfaces/security/IJwt';
import { BadRequestError } from '../../../shared/error/appError';
import { EventEnvelope, SendOtpEvent } from '../../dtos/kafka.dto';
import { toAppError } from '../../../shared/error/handleUnknownError';
import { IOTPService } from '../../../domain/interfaces/services/IOtp.service';
import { IKafkaProducerAdapter } from '../../../domain/interfaces/messaging/IKafkaProducerAdapter';

export class ResendOtpUseCase {

  constructor(
    private readonly otpService: IOTPService,
    private readonly kafkaProducer: IKafkaProducerAdapter,
    private readonly jwtService: IJWT
  ) { };

  async execute(input: ResendOtpOutput): Promise<void> {
    try {
      const { token } = input;
      if (!token) {
        throw new BadRequestError()
      }

      const { email, username } = await this.jwtService.verifyToken(token);
      if (!email) {
        throw new BadRequestError()
      }

      const otp = await this.otpService.setOtp(email);

      await this.kafkaProducer.publish<EventEnvelope<SendOtpEvent>>(kafkaConfig.topics.pub.sendOtp, {
        eventId: uuidv4(),
        attempt: 1,
        maxAttempts: 1,
        occurredAt: new Date().toISOString(),
        payload: {
          emailData: {
            email: email,
            name: username || email,
            otp,
            purpose: OtpPurpose.REGISTRATION
          }
        }
      });

      return;
    } catch (error: unknown) {
      throw toAppError(error, "Failed to resend OTP")
    }
  }
}
