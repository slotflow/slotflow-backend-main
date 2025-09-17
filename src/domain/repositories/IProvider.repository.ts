import { Types } from "mongoose";
import { Provider } from "../entities/provider.entity";
import { ApiPaginationRequest, ApiResponse } from "../../infrastructure/dtos/common.dto";
import { AdiminFetchAllProviders, AdminFetchDashboardProviderStatsDataResponse } from "../../infrastructure/dtos/admin.dto";

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
    createProvider(provider : CreateProviderProps) : Promise<Provider | null>;

    verifyProvider(verificationToken: string): Promise<Provider | null>;
    
    updateProvider(user: Provider): Promise<Provider | null>;
    
    findProviderByEmail(email : string) : Promise<Provider | null>;
    
    findAllProviders({page,limit}: ApiPaginationRequest): Promise<ApiResponse<AdiminFetchAllProviders>>;
    
    findProviderById(providerId: Types.ObjectId): Promise<Provider | null>;

    findProvidersCount(today?: { today : boolean }): Promise<number>;

    findProvidersStatsForAdminDashboard(): Promise<AdminFetchDashboardProviderStatsDataResponse>;

    findProviderByGoogleId(googleId: string): Promise<Provider | null>;
}