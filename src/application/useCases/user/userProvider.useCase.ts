import { log } from "../../../shared/logger/logger";
import { IBookingQueries } from "../../queries/IBooking.queries";
import { IProviderServiceQueries } from "../../queries/IProviderService.queries";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { UserFetchProviderServiceResponse, UserFetchProvidersForChatSidebarRequest, UserFetchProvidersForChatSidebarResponse, UserFetchServiceproviderServiceRequest, UserFetchServiceProvidersRequest, UserFetchServiceProvidersResponse } from "../../dtos/user.dto";

export class UserFetchServiceProvidersUseCase {
  constructor(
    private signedUrlService: ISignedUrlService,
    private providerServiceQueries: IProviderServiceQueries
  ) { };

  async execute(payload: UserFetchServiceProvidersRequest): Promise<Array<UserFetchServiceProvidersResponse> | null> {
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
      log.error("UserFetchServiceProvidersUseCase failed", error as Error);
      throw error;
    };
  };
};


export class UserFetchServiceProviderServiceDetailsUseCase {
  constructor(
    private providerServiceQueries: IProviderServiceQueries,
  ) { };

  async execute(payload: UserFetchServiceproviderServiceRequest): Promise<UserFetchProviderServiceResponse> {
    try {
      const { providerId } = payload;

      const serviceData = await this.providerServiceQueries.findByProviderId(providerId);
      if (!serviceData) return null;

      return {
        isGroupService: serviceData.isGroupService,
        maxParticipants: serviceData.maxParticipants,
        requirements: serviceData.requirements,
        service: serviceData.service,
        serviceDescription: serviceData.serviceDescription,
        serviceExperience: serviceData.serviceExperience,
        serviceMode: serviceData.serviceMode,
        serviceName: serviceData.serviceName,
        servicePrice: serviceData.servicePrice,
        serviceType: serviceData.serviceType,
        videoUrl: serviceData.videoUrl,
      };
    } catch (error) {
      log.error("UserFetchServiceProviderServiceDetailsUseCase failed", error as Error);
      throw error;
    };
  };
};

export class UserFetchProvidersForChatSidebarUseCase {
  constructor(
    private signedUrlService: ISignedUrlService,
    private bookingQueries: IBookingQueries
  ) { };

  async execute(payload: UserFetchProvidersForChatSidebarRequest): Promise<UserFetchProvidersForChatSidebarResponse> {
    try {
      const { userId } = payload;

      const result = await this.bookingQueries.findProvidersforChatSideBar(userId);

      const updatedResult: UserFetchProvidersForChatSidebarResponse = await Promise.all(
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
      log.error("UserFetchProvidersForChatSidebarUseCase failed", error as Error);
      throw error;
    };
  };
};