import { log } from "../../../shared/logger/logger";
import { IUserQueries } from "../../queries/IUser.queries";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { UserGetServiceProviderDetailsRequest, UserGetServiceProviderDetailsResponse } from "../../dtos/provider.dto";

export class UserGetProviderDetailsUseCase {
  constructor(
    private userQueries: IUserQueries,
    private signedUrlService: ISignedUrlService
  ) { };

  async execute(payload: UserGetServiceProviderDetailsRequest): Promise<UserGetServiceProviderDetailsResponse> {
    try {
      const { providerId } = payload;
      if (!providerId) throw new Error("Invalid request");

      const provider = await this.userQueries.findProviderById(providerId);
      if (!provider) throw new Error("Profile not found");

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
      log.error("UserGetProviderDetailsUseCase failed", error as Error);
      throw error;
    };
  };
};