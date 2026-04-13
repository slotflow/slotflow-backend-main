import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { UpdateStripeCustomerCreatedConsumeEvent } from "../../dtos/kafka.dtos";

export class UpdateStripeCustomerCreatedUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(payload: UpdateStripeCustomerCreatedConsumeEvent): Promise<void> {
        try {
            const { userId, stripeCustomerId } = payload;
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