import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/common.enum";
import { StripeAccountCreatedEvent } from "../../dtos/kafka.dtos";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";

export class UpdateStripeAccountDataUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
    ) { };

    async execute(payload: StripeAccountCreatedEvent): Promise<void> {
        try {
            const { userId, stripeAccountId } = payload;
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            user.linkStripeAccount(stripeAccountId);
            await this.userRepository.update(user);
        } catch (error) {
            log.error("UpdateStripeAccountDataUseCase failed", error as Error);
            throw error;
        };
    };
};