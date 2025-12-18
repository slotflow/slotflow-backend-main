// import { Types } from "mongoose";
import { Provider } from "../../entities/provider.entity";
// import { ProviderUpdateProfileRequest } from "../../../application/dtos/provider.dto";
// import { ApiPaginationRequest, ApiResponse } from "../../../application/dtos/common.dto";
// import { AdiminFetchAllProviders, AdminFetchDashboardProviderStatsDataResponse } from "../../../application/dtos/admin.dto";

// old types
// export type CreateLocalProvider = {
//   username: Provider["username"];
//   email: Provider["email"];
//   password: Provider["password"];
//   verificationToken: Provider["verificationToken"];
// };

// export type CreateGoogleProvider = {
//   username: Provider["username"];
//   email: Provider["email"];
//   googleId: Provider["googleId"];
//   profileImage: Provider["profileImage"];
//   isEmailVerified: Provider["isEmailVerified"];
//   googleConnected: Provider["googleConnected"];
// };

// export type CreateProviderProps = CreateLocalProvider | CreateGoogleProvider;

export interface IProviderRepository {
  // old methods
  // createProvider(provider: CreateProviderProps): Promise<Provider | null>;

  // findProviderByVerificationToken(verificationToken: Provider["verificationToken"]): Promise<Provider | null>;

  // updateProvider(user: Provider): Promise<Provider | null>;

  // findProviderByEmail(email: string): Promise<Provider | null>;

  // findAllProviders({ page, limit }: ApiPaginationRequest): Promise<ApiResponse<AdiminFetchAllProviders>>;

  // findProviderById(providerId: Types.ObjectId): Promise<Provider | null>;

  // findProvidersCount(today?: { today: boolean }): Promise<number>;

  // findProviderByGoogleId(googleId: string): Promise<Provider | null>;
  
  // findProvidersStatsForAdminDashboard(): Promise<AdminFetchDashboardProviderStatsDataResponse>;

  // updateProviderFields(data: ProviderUpdateProfileRequest): Promise<Provider | null>;

  // new methods 

  create(provider: Provider): Promise<Provider>;

  update(provider: Provider): Promise<Provider>;

  findById(providerId: string): Promise<Provider | null>;

  findByEmail(email: string): Promise<Provider | null>;

  findByGoogleId(googleId: string): Promise<Provider | null>;

  findByVerificationToken(token: string): Promise<Provider | null>;

  count(today?: boolean): Promise<number>;

}