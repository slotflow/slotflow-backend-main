import { ClientSession } from "mongoose";
import { ProviderProfile } from "../../entities/providerProfile.entity";

export interface IProviderProfileRepository {

  create(providerProfile: ProviderProfile, session?: ClientSession): Promise<ProviderProfile>;

  update(providerProfile: ProviderProfile, session?: ClientSession): Promise<ProviderProfile | null>;

  findById(providerProfileId: string): Promise<ProviderProfile | null>;

  findByUserId(userId: string): Promise<ProviderProfile | null>;

}