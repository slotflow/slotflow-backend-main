import { ERROR_CODES } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { StripeAccountStatus } from "../../../domain/enums/common.enum";
import { AppError, NotFoundError } from "../../../shared/error/appError";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IPaymentServiceClient } from "../../../domain/interfaces/clients/IPaymentService.client";
import { CheckStripeAccountStatusInput, CheckStripeAccountStatusOutput } from "../../dtos/user.dto";

export class CheckStripeAccountStatusUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly paymentServiceClient: IPaymentServiceClient
    ) { }

    async execute(input: CheckStripeAccountStatusInput): Promise<CheckStripeAccountStatusOutput> {
        try {
            const { userId } = input;
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new NotFoundError(
                    "User not found",
                    ERROR_CODES.USER_NOT_FOUND
                )
            }

            if (user.stripeAccountStatus === StripeAccountStatus.ACTIVE) {
                return { accountStatus: StripeAccountStatus.ACTIVE };
            } else {
                if (user.stripeAccountId) {
                    const res = await this.paymentServiceClient.checkStripeAccountStatus({ accoundId: user.stripeAccountId });
                    if (res.success) {
                        const status = res.data.accountStatus;
                        if (status === StripeAccountStatus.ACTIVE) {
                            user.updateStripeAccountStatus(status);
                            const updatedUser = await this.userRepository.update(user);
                            if (!updatedUser) {
                                throw new AppError(
                                    "Failed to update user",
                                    500,
                                    false,
                                    ERROR_CODES.INTERNAL_ERROR
                                )
                            }
                            return { accountStatus: status };
                        }
                    }
                }
                return { accountStatus: user.stripeAccountStatus };
            }

        } catch (error: unknown) {
            throw toAppError(error, "Failed to fetch stripe account status");
        }
    }
}