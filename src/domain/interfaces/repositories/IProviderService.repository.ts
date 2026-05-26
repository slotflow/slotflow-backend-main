import { ClientSession } from "mongoose";
import { ProviderService } from "../../entities/providerService.entity";

export interface IProviderServiceRepository {

    create(providerService: ProviderService, session?: ClientSession): Promise<ProviderService | null>;

    findById(providerServiceId: string): Promise<ProviderService | null>;

    update(providerService: ProviderService, session?: ClientSession): Promise<ProviderService | null>;

}