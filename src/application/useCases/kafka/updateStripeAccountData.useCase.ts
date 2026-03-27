import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/common.enum";
import { StripeAccountCreatedEvent } from "../../dtos/kafka.dtos";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";

export class UpdateStripeAccountDataUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly providerRepository: IProviderRepository
    ) { };

    async execute(payload: StripeAccountCreatedEvent): Promise<void> {
        try {
            const { role, userId, stripeAccountId} = payload;

            if(role === Role. USER) {
                const user = await this.userRepository.findById(userId);
                if(!user) {
                    throw new Error("User not found");
                }
                user.linkStripeAccount(stripeAccountId);
                await this.userRepository.update(user);
            } else if(role === Role.PROVIDER) {
                const provider = await this.providerRepository.findById(userId);
                if(!provider) {
                    throw new Error("Provider not found");
                }
                provider.linkStripeAccount(stripeAccountId);
                await this.providerRepository.update(provider);
            }
        } catch (error) {
            log.error("UpdateStripeAccountDataUseCase failed", error as Error);
            throw error;
        };
    };
};