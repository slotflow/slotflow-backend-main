import { PlanName } from "../../../domain/enums/plan.enum";
import { User } from "../../../domain/entities/user.entity";
import { BaseUserResponse, ProviderFieldsResponse } from "../../dtos/auth.dto";
import { ProviderProfile } from "../../../domain/entities/providerProfile.entity";

export interface IAuthResponseBuilder {
  buildBaseUser(user: User): BaseUserResponse;

  buildProviderFields(
    providerProfile: ProviderProfile | null,
    providerSubscription: PlanName,
  ): ProviderFieldsResponse;

  resolveSubscription(providerProfile: ProviderProfile): Promise<PlanName>;
}
