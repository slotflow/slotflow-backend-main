import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/common.enum";
import { LinkStripeCustomerRequest } from "../../dtos/common.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";

export class LinkStripeCustomerUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly providerRepository: IProviderRepository
    ) { };

    async execute(payload: LinkStripeCustomerRequest): Promise<void> {
        try {
            const { role, stripeCustomerId, userId } = payload;

            switch (role) {
                case Role.USER:
                    const user = await this.userRepository.findById(userId);
                    if (!user) throw new Error("User not found.");
                    user.linkStripeCustomer(stripeCustomerId);
                    await this.userRepository.update(user);
                    break;
                case Role.PROVIDER:
                    const provider = await this.providerRepository.findById(userId);
                    if (!provider) throw new Error("Provider not found.");
                    provider.linkStripeCustomer(stripeCustomerId);
                    await this.providerRepository.update(provider);
                    break;
            }
        } catch (error) {
            log.error("LinkStripeCustomerUseCase failed : ", error as Error);
        }
    }
}