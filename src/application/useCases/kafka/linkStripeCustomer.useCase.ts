import { log } from "../../../shared/logger/logger";
import { LinkStripeCustomerEventInput } from "../../dtos/kafka.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";

export class LinkStripeCustomerUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
    ) { };

    async execute(input: LinkStripeCustomerEventInput): Promise<void> {
        try {
            const { stripeCustomerId, userId } = input;
            const user = await this.userRepository.findById(userId);
            if (!user) throw new Error("User not found.");
            user.linkStripeCustomer(stripeCustomerId);
            await this.userRepository.update(user);
        } catch (error) {
            log.error("LinkStripeCustomerUseCase failed : ", error as Error);
        }
    }
}