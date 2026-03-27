import { Role } from "../../../domain/enums/common.enum";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { UserRepositoryImpl } from "../../../infrastructure/repositoryImpls/user.repository.impl";
import { UpdateStripeCustomerCreatedConsumeEvent } from "../../dtos/kafka.dtos";

export class UpdateStripeCustomerCreatedUseCase {
    constructor(
        private readonly userRepository: UserRepositoryImpl,
        private readonly providerRepository: IProviderRepository
    ) { }

    async execute(payload: UpdateStripeCustomerCreatedConsumeEvent): Promise<void> {
        try {
            const { userId, stripeCustomerId, role } = payload;
            if(role === Role. USER) {
                const user = await this.userRepository.findById(userId);
                if(!user) {
                    throw new Error("User not found");
                }
                user.linkStripeCustomer(stripeCustomerId);
                await this.userRepository.update(user);
            } else if(role === Role.PROVIDER) {
                const provider = await this.providerRepository.findById(userId);
                if(!provider) {
                    throw new Error("Provider not found");
                }
                provider.linkStripeCustomer(stripeCustomerId);
                await this.providerRepository.update(provider);
            }
        } catch (error) {
            console.error("UpdateStripeCustomerCreatedUseCase failed : ", error as Error);
        }
    }
}