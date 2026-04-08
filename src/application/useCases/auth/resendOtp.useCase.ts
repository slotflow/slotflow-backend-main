import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from '../../../config/env';
import { log } from '../../../shared/logger/logger';
import { ResendOtpRequest } from '../../dtos/auth.dto';
import { OtpPurpose } from '../../../domain/enums/common.enum';
import { IJWT } from '../../../domain/interfaces/security/IJwt';
import { EventEnvelope, SendOtpEvent } from '../../dtos/kafka.dtos';
import { IOTPService } from '../../../domain/interfaces/services/IOtp.service';
import { IKafkaProducerAdapter } from '../../../domain/interfaces/messaging/IKafkaProducerAdapter';

export class ResendOtpUseCase {

  constructor(
    private readonly otpService: IOTPService,
    private readonly kafkaProducer: IKafkaProducerAdapter,
    private readonly jwtService: IJWT
  ) { };

  async execute(payload: ResendOtpRequest): Promise<void> {
    try {
      const { token } = payload;
      if (!token) throw new Error("Invalid request.");

      const { email, username } = await this.jwtService.verifyToken(token);
      if(!email) throw new Error("Invalid request, please try again");

      const otp = await this.otpService.setOtp(email);
      if (!otp) throw new Error("Unexpected error, please try again.");

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
    } catch (error) {
      log.error("ResendOtpUseCase failed", error as Error);
      throw error;
    };
  };
};
