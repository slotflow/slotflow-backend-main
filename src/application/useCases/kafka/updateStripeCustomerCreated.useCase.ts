import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { UpdateStripeCustomerCreatedConsumeEventInput } from "../../dtos/kafka.dto";

export class UpdateStripeCustomerCreatedUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(input: UpdateStripeCustomerCreatedConsumeEventInput): Promise<void> {
        try {
            const { userId, stripeCustomerId } = input;
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            user.linkStripeCustomer(stripeCustomerId);
            await this.userRepository.update(user);
        } catch (error) {
            console.error("UpdateStripeCustomerCreatedUseCase failed : ", error as Error);
        }
    }
}