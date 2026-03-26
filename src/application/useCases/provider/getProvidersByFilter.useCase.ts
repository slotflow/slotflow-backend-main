import { log } from "../../../shared/logger/logger";
import { IProviderServiceQueries } from "../../queries/IProviderService.queries";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { GetProvidersByFilterRequest, GetProvidersByFilterResponse } from "../../dtos/provider.dto";

export class GetProvidersByFilterUseCase {
  constructor(
    private signedUrlService: ISignedUrlService,
    private providerServiceQueries: IProviderServiceQueries
  ) { };

  async execute(payload: GetProvidersByFilterRequest): Promise<Array<GetProvidersByFilterResponse> | null> {
    try {
      const { serviceIds, categories, location, maxPrice, minPrice, slotflowTrusted, skip, limit } = payload;

      const providers = await this.providerServiceQueries.findProvidersUsingServiceIds({
        serviceIds: serviceIds ?? [], 
        categories: categories ?? [], 
        location, 
        maxPrice, 
        minPrice,
        slotflowTrusted: slotflowTrusted,
        skip,
        limit
      });
      if (!providers) return null;

      const updatedProviders = await Promise.all(
        providers.map(async (provider) => {
          let profileImageUrl = provider?.provider?.profileImage;

          if (profileImageUrl) {
            const signedUrl = await this.signedUrlService.get(profileImageUrl);
            provider.provider.profileImage = signedUrl;
          };

          return provider;
        }),
      );

      return updatedProviders;
    } catch (error) {
      log.error("GetProvidersByFilterUseCase failed", error as Error);
      throw error;
    };
  };
};