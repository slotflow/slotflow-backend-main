import { ProviderService } from "../../entities/providerService.entity";

export interface IProviderServiceRepository {

    create(providerService: ProviderService): Promise<ProviderService>;

    findById(providerServiceId: string): Promise<ProviderService | null>;

    update(providerService: ProviderService): Promise<ProviderService>;

    findByProviderId(providerId: string): Promise<ProviderService | null>;

}