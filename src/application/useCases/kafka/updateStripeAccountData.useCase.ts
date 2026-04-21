import { log } from "../../../shared/logger/logger";
import { StripeAccountCreatedEvent } from "../../dtos/kafka.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";

export class UpdateStripeAccountDataUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
    ) { };

    async execute(input: StripeAccountCreatedEvent): Promise<void> {
        try {
            const { userId, stripeAccountId } = input;
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            user.linkStripeAccount(stripeAccountId);
            await this.userRepository.update(user);
        } catch (error) {
            log.error("UpdateStripeAccountDataUseCase failed", error as Error);
        };
    };
};