import { ERROR_CODES } from "../../../shared/utils/types";
import { IUserQueries } from "../../queries/IUser.queries";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { UserGetServiceProviderDetailsInput, UserGetServiceProviderDetailsOutput } from "../../dtos/user.dto";

export class UserGetProviderDetailsUseCase {
  constructor(
    private userQueries: IUserQueries,
    private signedUrlService: ISignedUrlService
  ) { };

  async execute(input: UserGetServiceProviderDetailsInput): Promise<UserGetServiceProviderDetailsOutput> {
    try {
      const { providerId } = input;
      if (!providerId) {
        throw new BadRequestError();
      }

      const provider = await this.userQueries.findProviderById({ providerId });
      if (!provider) {
        throw new NotFoundError(
          "Provider not found",
          ERROR_CODES.USER_NOT_FOUND
        );
      }

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
    } catch (error: unknown) {
      throw toAppError(error, "Failed to get provider details");
    };
  };
};