import { log } from "../../../shared/logger/logger";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { UserFetchServiceProviderDetailsRequest, UserFetchServiceProviderDetailsResponse } from "../../dtos/provider.dto";

export class UserFetchProviderDetailsUseCase {
  constructor(
    private providerRepository: IProviderRepository,
    private signedUrlService: ISignedUrlService
  ) { };

  async execute(payload: UserFetchServiceProviderDetailsRequest): Promise<UserFetchServiceProviderDetailsResponse> {
    try {
      const { providerId } = payload;
      if (!providerId) throw new Error("Invalid request");

      const provider = await this.providerRepository.findById(providerId);
      if (!provider) throw new Error("No provider found");

      let signedProfileImageUrl: string | null = null;
      if (provider.profileImage) {
        signedProfileImageUrl = await this.signedUrlService.get(provider.profileImage);
      };

      return {
        username: provider.username,
        email: provider.email,
        phone: provider.phone,
        profileImage: signedProfileImageUrl,
        trustedBySlotflow: provider.trustedBySlotflow,
      };
    } catch (error) {
      log.error("UserFetchProviderDetailsUseCase failed", error as Error);
      throw error;
    };
  };
};