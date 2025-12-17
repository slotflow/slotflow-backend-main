import { Types } from "mongoose";
import { Provider } from "../../entities/provider.entity";
import { ProviderUpdateProfileRequest } from "../../../application/dtos/provider.dto";
import { ApiPaginationRequest, ApiResponse } from "../../../application/dtos/common.dto";
import { AdiminFetchAllProviders, AdminFetchDashboardProviderStatsDataResponse } from "../../../application/dtos/admin.dto";

export type CreateLocalProvider = {
  username: Provider["username"];
  email: Provider["email"];
  password: Provider["password"];
  verificationToken: Provider["verificationToken"];
};

export type CreateGoogleProvider = {
  username: Provider["username"];
  email: Provider["email"];
  googleId: Provider["googleId"];
  profileImage: Provider["profileImage"];
  isEmailVerified: Provider["isEmailVerified"];
  googleConnected: Provider["googleConnected"];
};

export type CreateProviderProps = CreateLocalProvider | CreateGoogleProvider;

export interface IProviderRepository {
  createProvider(provider: CreateProviderProps): Promise<Provider | null>;

  findProviderByVerificationToken(verificationToken: Provider["verificationToken"]): Promise<Provider | null>;

  updateProvider(user: Provider): Promise<Provider | null>;

  findProviderByEmail(email: string): Promise<Provider | null>;

  findAllProviders({ page, limit }: ApiPaginationRequest): Promise<ApiResponse<AdiminFetchAllProviders>>;

  findProviderById(providerId: Types.ObjectId): Promise<Provider | null>;

  findProvidersCount(today?: { today: boolean }): Promise<number>;

  findProvidersStatsForAdminDashboard(): Promise<AdminFetchDashboardProviderStatsDataResponse>;

  findProviderByGoogleId(googleId: string): Promise<Provider | null>;

  updateProviderFields(data: ProviderUpdateProfileRequest): Promise<Provider | null>;
}