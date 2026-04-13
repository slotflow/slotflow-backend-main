import { log } from "../../../shared/logger/logger";
import { IBookingQueries } from "../../queries/IBooking.queries";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { GetProvidersForChatRequest, GetProvidersForChatResponse } from "../../dtos/provider.dto";

export class GetProvidersForChatUseCase {
  constructor(
    private signedUrlService: ISignedUrlService,
    private bookingQueries: IBookingQueries
  ) { };

  async execute(payload: GetProvidersForChatRequest): Promise<GetProvidersForChatResponse> {
    try {
      const { userId } = payload;

      const result = await this.bookingQueries.findProvidersforChatSideBar(userId);

      const updatedResult: GetProvidersForChatResponse = await Promise.all(
        result.map(async (provider) => {
          let profileImageUrl = provider?.profileImage;

          if (profileImageUrl) {
            const signedUrl = await this.signedUrlService.get(profileImageUrl);
            provider.profileImage = signedUrl;
          }

          return provider;
        })
      )

      return updatedResult;
    } catch (error) {
      log.error("GetProvidersForChatUseCase failed", error as Error);
      throw error;
    };
  };
};