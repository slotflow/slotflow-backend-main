import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { User } from "../../../domain/entities/user.entity";
import { OTPVerificationRequest } from "../../dtos/auth.dto";
import { IJWT } from '../../../domain/interfaces/security/IJwt';
import { EventEnvelope, SendWelcomeEvent } from "../../dtos/kafka.dtos";
import { IOTPService } from "../../../domain/interfaces/services/IOtp.service";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";

export class VerifyOTPUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpService: IOTPService,
    private readonly kafkaProducer: IKafkaProducerAdapter,
    private readonly jwtService: IJWT
  ) { };

  async execute(payload: OTPVerificationRequest): Promise<void> {
    try {
      const { token, otp } = payload;

      if (!token) {
        throw new Error("Invalid request");
      };

      const { email, username, password } = await this.jwtService.verifyToken(token);

      if (!email || !username || !password) throw new Error("Invalid request, please try again");

      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) throw new Error("User already exists");

      const isValidOTP = await this.otpService.verifyOtp(email, otp);
      if (!isValidOTP) throw new Error("Invalid or expired OTP");

      if(!existingUser) {
        const newUser = await this.userRepository.create(User.createLocal({
          email,
          username,
          password,
        }));
        
      await this.kafkaProducer.publish<EventEnvelope<SendWelcomeEvent>>(kafkaConfig.topics.pub.registerSuccess, {
        eventId: uuidv4(),
        attempt: 1,
        maxAttempts: 1,
        occurredAt: new Date().toISOString(),
        payload: {
          emailData: {
            email: newUser.email,
            name: newUser.username,
            role: newUser.role,
          },
        }
      });
    }

    } catch (error) {
      log.error("VerifyOTPUseCase failed", error as Error);
      throw error;
    };
  };
}
