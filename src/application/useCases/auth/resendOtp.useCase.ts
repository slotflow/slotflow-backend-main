import { kafkaConfig } from "../../../config/env";
import { ResendOtpOutput } from "../../dtos/auth.dto";
import { IdType } from "../../../shared/utils/types/enums";
import { IJWT } from "../../interfaces/security/IJwt.service";
import { OtpPurpose } from "../../../domain/enums/common.enum";
import { BadRequestError } from "../../../shared/error/appError";
import { EventEnvelope, SendOtpEvent } from "../../dtos/kafka.dto";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { generateId } from "../../../shared/utils/helpers/generateId";
import { IOTPService } from "../../interfaces/services/IOtp.service";
import { IKafkaProducerAdapter } from "../../interfaces/messaging/IKafkaProducer.adapter";

export class ResendOtpUseCase {
  constructor(
    private readonly otpService: IOTPService,
    private readonly kafkaProducer: IKafkaProducerAdapter,
    private readonly jwtService: IJWT,
  ) {}

  async execute(input: ResendOtpOutput): Promise<void> {
    try {
      const { token } = input;
      if (!token) {
        throw new BadRequestError();
      }

      const { email } = await this.jwtService.verifyToken(token);
      if (!email) {
        throw new BadRequestError();
      }

      const otp = await this.otpService.setOtp(email);

      await this.kafkaProducer.publish<EventEnvelope<SendOtpEvent>>(
        kafkaConfig.topics.pub.sendOtp,
        {
          eventId: generateId({ type: IdType.EVENT }),
          attempt: 1,
          maxAttempts: 1,
          occurredAt: new Date(),
          payload: {
            emailData: {
              email: email,
              otp,
              purpose: OtpPurpose.REGISTRATION,
            },
          },
        },
      );

      return;
    } catch (error: unknown) {
      throw toAppError(error, "Failed to resend OTP");
    }
  }
}
