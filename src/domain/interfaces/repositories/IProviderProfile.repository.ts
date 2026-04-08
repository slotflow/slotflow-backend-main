import { ProviderProfile } from "../../entities/providerProfile.entity";

export interface IProviderProfileRepository {

  create(providerProfile: ProviderProfile): Promise<ProviderProfile>;

  update(providerProfile: ProviderProfile): Promise<ProviderProfile>;

  findById(providerProfileId: string): Promise<ProviderProfile | null>;

  findByUserId(userId: string): Promise<ProviderProfile | null>;

}