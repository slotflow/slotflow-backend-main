import { ERROR_CODES } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { AppError, NotFoundError } from "../../../shared/error/appError";
import { StripeAccountUpdateStatusEventInput } from "../../dtos/kafka.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";

export class UpdateStripeAccountStatusUseCase {
    constructor(
        private readonly userRepository: IUserRepository
    ) { }

    async execute(input: StripeAccountUpdateStatusEventInput): Promise<void> {
        try {
            const { accountStatus, userId } = input;
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new NotFoundError(
                    "User not found",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }
            user.updateStripeAccountStatus(accountStatus);
            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) {
                throw new AppError(
                    "Failed to update stripe account status",
                    500,
                    false,
                    ERROR_CODES.INTERNAL_ERROR
                )
            }
        } catch (error: unknown) {
            throw toAppError(error, "Failed to update stripe account status");
        }
    }
}