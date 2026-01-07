import dayjs from "dayjs";
import { log } from "../../../shared/logger/logger";
import { IBookingQueries } from "../../queries/IBooking.queries";
import { IProviderServiceQueries } from "../../queries/IProviderService.queries";
import { IServiceAvailabilityQueries } from "../../queries/IServiceAvailability.queries";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { IAddressRepository } from "../../../domain/interfaces/repositories/IAddress.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { UserFetchProviderServiceAvailabilityRequest, UserFetchProviderServiceAvailabilityResponse, UserFetchProviderServiceResponse, UserFetchProvidersForChatSidebarRequest, UserFetchProvidersForChatSidebarResponse, UserFetchServiceProviderAddressRequest, UserFetchServiceProviderAddressResponse, UserFetchServiceProviderDetailsRequest, UserFetchServiceProviderDetailsResponse, UserFetchServiceproviderServiceRequest, UserFetchServiceProvidersRequest, UserFetchServiceProvidersResponse } from "../../dtos/user.dto";

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

      console.log("updatedProviders : ",updatedProviders);

      return updatedProviders;
    } catch (error) {
      log.error("UserFetchServiceProvidersUseCase failed", error as Error);
      throw error;
    };
  };
};


export class UserFetchServiceProviderProfileDetailsUseCase {
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

      let props = provider.getProps();

      return {
        _id: props._id,
        username: props.username,
        email: props.email,
        phone: props.phone,
        profileImage: signedProfileImageUrl,
        trustedBySlotflow: props.trustedBySlotflow,
      };
    } catch (error) {
      log.error("UserFetchServiceProviderProfileDetailsUseCase failed", error as Error);
      throw error;
    };
  };
};


export class UserFetchServiceProviderAddressUseCase {
  constructor(
    private addressRepository: IAddressRepository,
  ) { };

  async execute(payload: UserFetchServiceProviderAddressRequest): Promise<UserFetchServiceProviderAddressResponse> {
    try {
      const { providerId } = payload;
      if (!providerId) throw new Error("Invalid request");

      const address = await this.addressRepository.findByUserId(providerId);
      if (!address) throw new Error("No address found");

      let { createdAt, updatedAt, _id, ...rest } = address.getProps();

      return rest;
    } catch (error) {
      log.error("UserFetchServiceProviderAddressUseCase failed", error as Error);
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


export class UserFetchServiceProviderServiceAvailabilityUseCase {
  constructor(
    private providerRepository: IProviderRepository,
    private serviceAvailabilityQueries: IServiceAvailabilityQueries
  ) { };

  async execute(payload: UserFetchProviderServiceAvailabilityRequest): Promise<UserFetchProviderServiceAvailabilityResponse> {
    try {
      const { providerId, date } = payload;
      const currentDateTime = dayjs();
      const selectedDate = dayjs(date).format('YYYY-MM-DD');

      const provider = await this.providerRepository.findById(providerId);
      if (!provider) throw new Error("nNo provider found");
      if (!provider.serviceAvailabilityId) return null;

      const availability = await this.serviceAvailabilityQueries.findByProviderId(date, provider.serviceAvailabilityId);
      if (!availability) return null;

      const updatedSlots = availability.slots.map((slot) => {
        const slotDateTime = dayjs(`${selectedDate} ${slot.time}`, 'YYYY-MM-DD hh:mm A');
        const isWithin2Hours = slotDateTime.diff(currentDateTime, 'minute') < 120;
        return {
          ...slot,
          available: slot.available && !isWithin2Hours
        }
      });

      return { ...availability, slots: updatedSlots };
    } catch (error) {
      log.error("UserFetchServiceProviderServiceAvailabilityUseCase failed", error as Error);
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