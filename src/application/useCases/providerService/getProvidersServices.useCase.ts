import { log } from "../../../shared/logger/logger";
import { IProviderServiceQueries } from "../../queries/IProviderService.queries";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { GetProvidersServicesInput, GetProvidersServicesOutput } from "../../dtos/providerService";

export class GetProvidersServicesUseCase {
  constructor(
    private signedUrlService: ISignedUrlService,
    private providerServiceQueries: IProviderServiceQueries
  ) { };

  async execute(input: GetProvidersServicesInput): Promise<GetProvidersServicesOutput | null> {
    try {
      const { serviceIds, categories, location, maxPrice, minPrice, slotflowTrusted, skip, limit } = input;

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
      log.error("GetProvidersServicesUseCase failed", error as Error);
      throw error;
    };
  };
};