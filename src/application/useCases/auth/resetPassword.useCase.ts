import { Redis } from "@upstash/redis";
import { PasswordResetGrant, ResetPasswordInput } from "../../dtos/auth.dto";
import { AppError, BadRequestError, UnauthorizedError } from "../../../shared/error/appError";
import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { generateId } from "../../../shared/utils/helpers/generateId";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { ERROR_CODES, IdType } from "../../../shared/utils/types/enums";
import { EventEnvelope, SendResetPasswordEvent } from "../../dtos/kafka.dto";
import { IPasswordHasher } from "../../interfaces/security/IPasswordHasher.service";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IKafkaProducerAdapter } from "../../interfaces/messaging/IKafkaProducer.adapter";

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly kafkaProducer: IKafkaProducerAdapter,
    private readonly redisClient: Redis,
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    try {
      const { resetGrant, password } = input;

      if (!resetGrant || !password || !/^[a-f0-9]{64}$/.test(resetGrant)) {
        throw new BadRequestError("Invalid password reset request");
      }

      const redisKey = `password-reset:grant:${resetGrant}`;

      const grant = await this.redisClient.getdel<PasswordResetGrant>(redisKey);

      if (!grant) {
        throw new UnauthorizedError(
          "Password reset session expired or already used",
          ERROR_CODES.UNAUTHORIZED,
        );
      }

      const user = await this.userRepository.findById(grant.userId);

      if (!user || user.isBlocked) {
        throw new UnauthorizedError("Password reset is not permitted", ERROR_CODES.UNAUTHORIZED);
      }

      const hashedPassword = await this.passwordHasher.hashPassword(password);

      user.changePassword({
        password: hashedPassword,
      });

      const updatedUser = await this.userRepository.update(user);

      if (!updatedUser) {
        throw new AppError("Failed to update user", 500, false, ERROR_CODES.INTERNAL_ERROR);
      }

      try {
        await this.kafkaProducer.publish<EventEnvelope<SendResetPasswordEvent>>(
          kafkaConfig.topics.pub.passwordReset,
          {
            eventId: generateId({ type: IdType.EVENT }),
            attempt: 1,
            maxAttempts: 1,
            occurredAt: new Date(),
            payload: {
              emailData: {
                email: updatedUser.email,
                name: updatedUser.username,
              },
            },
          },
        );
      } catch (error) {
        log.error("Failed to publish password reset event", {
          error,
        });
      }
    } catch (error: unknown) {
      throw toAppError(error, "Failed to reset password");
    }
  }
}
