import { toAppError } from "../../../shared/error/handleUnknownError";
import { IProviderServiceQueries } from "../../queries/IProviderService.queries";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { GetProvidersServicesInput, GetProvidersServicesOutput } from "../../dtos/providerService.dto";

export class GetProvidersServicesUseCase {
  constructor(
    private signedUrlService: ISignedUrlService,
    private providerServiceQueries: IProviderServiceQueries
  ) { };

  async execute(input: GetProvidersServicesInput): Promise<GetProvidersServicesOutput | null> {
    try {
      console.log("input : ",input);
      const { serviceIds, categories, location, maxPrice, minPrice, slotflowTrusted, skip, limit } = input;

      const providers = await this.providerServiceQueries.findProvidersCardDataForUsers({
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

      console.log("providers : ",providers);

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
    } catch (error: unknown) {
      throw toAppError(error, "Failed to get provider serices");
    };
  };
};