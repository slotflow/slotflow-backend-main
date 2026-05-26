import { ERROR_CODES } from "../../../shared/utils/types";
import { ChangePushNotificationInput } from "../../dtos/user.dto";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";

export class ChangePushNotificationUseCase {
    constructor(
        private userRepository: IUserRepository
    ) { };

    async execute(input: ChangePushNotificationInput): Promise<void> {
        try {
            const { allowPushNotification, userId } = input;
            if (!userId) {
                throw new BadRequestError();
            }

            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new NotFoundError(
                    "User not found",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }

            user.updatePushNotification({ allowPushNotification });

            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) {
                throw new AppError(
                    "Failed to update push notification",
                    500,
                    false,
                    ERROR_CODES.INTERNAL_ERROR
                )
            }
        } catch (error: unknown) {
            throw toAppError(error, "Failed to change push notification");
        };
    };
};