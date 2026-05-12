import { ERROR_CODES } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { AppError, NotFoundError } from "../../../shared/error/appError";
import { UpdateStripeCustomerCreatedConsumeEventInput } from "../../dtos/kafka.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";

export class UpdateStripeCustomerCreatedUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(input: UpdateStripeCustomerCreatedConsumeEventInput): Promise<void> {
        try {
            const { userId, stripeCustomerId } = input;
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new NotFoundError(
                    "User not found",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }
            user.linkStripeCustomer(stripeCustomerId);
            const updatedUser = await this.userRepository.update(user);
            if(!updatedUser) {
                throw new AppError(
                    "Filed to update",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                )
            }
        } catch (error) {
            throw toAppError(error, "Failed to update stripe customer id");
        }
    }
}