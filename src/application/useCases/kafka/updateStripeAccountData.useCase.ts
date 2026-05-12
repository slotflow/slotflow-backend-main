import { log } from "../../../shared/logger/logger";
import { ERROR_CODES } from "../../../shared/utils/types";
import { StripeAccountCreatedEventInput } from "../../dtos/kafka.dto";
import { AppError, NotFoundError } from "../../../shared/error/appError";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { toAppError } from "../../../shared/error/handleUnknownError";

export class UpdateStripeAccountDataUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
    ) { };

    async execute(input: StripeAccountCreatedEventInput): Promise<void> {
        try {
            const { userId, stripeAccountId } = input;
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new NotFoundError(
                    "User not found",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }
            user.linkStripeAccount(stripeAccountId);
            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) {
                throw new AppError(
                    "Filed to update",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                )
            }
        } catch (error) {
            throw toAppError(error, "Failed to update stripe account id");
        };
    };
};