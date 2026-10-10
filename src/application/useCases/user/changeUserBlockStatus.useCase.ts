import { kafkaConfig } from "../../../config/env";
import { generateId } from "../../../shared/utils/helpers/generateId";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { ERROR_CODES, IdType } from "../../../shared/utils/types/enums";
import { EventEnvelope, SendAccountBlockStatusEvent } from "../../dtos/kafka.dto";
import { ICacheService } from "../../interfaces/services/ICache.service";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IKafkaProducerAdapter } from "../../interfaces/messaging/IKafkaProducer.adapter";
import {
  ChangeUserIsBlockedStatusInput,
  ChangeUserIsBlockedStatusOutput,
} from "../../dtos/user.dto";

export class ChangeUserBlockStatusUseCase {
  constructor(
    private userRepository: IUserRepository,
    private kafkaProducer: IKafkaProducerAdapter,
    private cacheService: ICacheService,
  ) {}

  async execute(input: ChangeUserIsBlockedStatusInput): Promise<ChangeUserIsBlockedStatusOutput> {
    try {
      const { userId, isBlocked } = input;
      if (!userId) {
        throw new BadRequestError();
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError("User not found.", ERROR_CODES.USER_NOT_FOUND);
      }

      if (isBlocked) {
        user.block();
      } else {
        user.unblock();
      }

      const updatedUser = await this.userRepository.update(user);
      if (!updatedUser) {
        throw new AppError("Failed to update block status", 500, false, ERROR_CODES.INTERNAL_ERROR);
      }

      if (updatedUser.isBlocked) {
        await this.cacheService.setBlockList(userId, JSON.stringify(isBlocked));
      } else {
        await this.cacheService.deleteBlockList(userId);
      }

      await this.kafkaProducer.publish<EventEnvelope<SendAccountBlockStatusEvent>>(
        kafkaConfig.topics.pub.accountBlockStatus,
        {
          eventId: generateId({ type: IdType.EVENT }),
          attempt: 1,
          maxAttempts: 1,
          occurredAt: new Date(),
          payload: {
            emailData: {
              email: user.email,
              name: user.username,
              blocked: updatedUser.isBlocked,
            },
          },
        },
      );

      return { _id: userId, isBlocked: updatedUser.isBlocked };
    } catch (error: unknown) {
      throw toAppError(error, "Failed to change user block status");
    }
  }
}
