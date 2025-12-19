import dayjs from "dayjs";
import { Types } from "mongoose";
import { ApiResponse } from "../../dtos/common.dto";
import { FindProviderServiceResponse } from "../../dtos/admin.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { IAddressRepository } from "../../../domain/interfaces/repositories/IAddress.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { IProviderServiceRepository } from "../../../domain/interfaces/repositories/IProviderService.repository";
import { IServiceAvailabilityRepository } from "../../../domain/interfaces/repositories/IServiceAvailability.repository";
import { FindProvidersUsingServiceIdsResponse, UserFetchProviderServiceAvailabilityRequest, UserFetchProviderServiceAvailabilityResponse, UserFetchProviderServiceResponse, UserFetchProvidersForChatSidebarRequest, UserFetchProvidersForChatSidebarResponse, UserFetchServiceProviderAddressRequest, UserFetchServiceProviderAddressResponse, UserFetchServiceProviderDetailsRequest, UserFetchServiceProviderDetailsResponse, UserFetchServiceproviderServiceRequest, UserFetchServiceProvidersRequest, UserFetchServiceProvidersResponse } from "../../dtos/user.dto";

export class UserFetchServiceProvidersUseCase {
  constructor(
    private userRepository: IUserRepository,
    private providerServiceRepository: IProviderServiceRepository,
    private signedUrlService: ISignedUrlService
  ) { }

  async execute(payload: UserFetchServiceProvidersRequest): Promise<ApiResponse<Array<UserFetchServiceProvidersResponse>>> {
    try {
      const { userId, serviceIds } = payload;
      if (!userId || !serviceIds) throw new Error("Invalid request.");

      const user = await this.userRepository.findById(userId);
      if (!user) throw new Error("No user found");

      const providers = await this.providerServiceRepository.findProvidersUsingServiceIds(serviceIds);
      if (!providers) throw new Error("Providers fetching error.");

      const updatedproviders: FindProvidersUsingServiceIdsResponse[] = await Promise.all(
        providers.map(async (provider) => {
          let profileImageUrl = provider?.provider?.profileImage;

          if (profileImageUrl) {
            const signedUrl = await this.signedUrlService.generate(profileImageUrl);
            provider.provider.profileImage = signedUrl;
          }

          return provider;
        })
      )

      return { success: true, message: "Providers fetched successfully.", data: updatedproviders };
    } catch (error) {
      console.log("UserFetchServiceProvidersUseCase error : ", error);
      throw new Error("Failed to fetch service providers");
    }
  }
}


export class UserFetchServiceProviderProfileDetailsUseCase {
  constructor(
    private userRepository: IUserRepository,
    private providerRepository: IProviderRepository,
    private signedUrlService: ISignedUrlService
  ) { }

  async execute(payload: UserFetchServiceProviderDetailsRequest): Promise<ApiResponse<UserFetchServiceProviderDetailsResponse>> {
    try {
      const { userId, providerId } = payload;
      if (!userId || !providerId) throw new Error("Invalid request");

      const user = await this.userRepository.findById(userId);
      if (!user) throw new Error("No user found");

      const provider = await this.providerRepository.findById(providerId);
      if (!provider) throw new Error("No provider found");

      if (provider.profileImage) {
        const signedUrl = await this.signedUrlService.generate(provider.profileImage);
        provider.profileImage = signedUrl;
      }

      let { _id, username, email, phone, profileImage, trustedBySlotflow } = provider;

      return { success: true, message: "Service provider details fetched", data: { _id, username, email, phone, profileImage, trustedBySlotflow } }
    } catch (error) {
      console.log("UserFetchServiceProviderProfileDetailsUseCase error : ", error);
      throw new Error("Failed to fetch service provider profile");
    }
  }
}


export class UserFetchServiceProviderAddressUseCase {
  constructor(
    private userRepository: IUserRepository,
    private addressRepository: IAddressRepository,
  ) { }

  async execute(payload: UserFetchServiceProviderAddressRequest): Promise<ApiResponse<UserFetchServiceProviderAddressResponse>> {
    try {
      const { userId, providerId } = payload;
      if (!userId || !providerId) throw new Error("Invalid request");

      const user = await this.userRepository.findById(userId);
      if (!user) throw new Error("No user found");

      const address = await this.addressRepository.findByUserId(providerId);
      if (!address) throw new Error("No address found");

      let { createdAt, updatedAt, _id, ...rest } = address;

      return { success: true, message: "Service provider address fetched", data: rest }
    } catch (error) {
      console.log("UserFetchServiceProviderAddressUseCase error : ", error);
      throw new Error("Failed to fetch service provider address");
    }
  }
}


export class UserFetchServiceProviderServiceDetailsUseCase {
  constructor(
    private userRepository: IUserRepository,
    private providerServiceRepository: IProviderServiceRepository,
  ) { }

  async execute(payload: UserFetchServiceproviderServiceRequest): Promise<ApiResponse<UserFetchProviderServiceResponse>> {
    try {
      const { userId, providerId } = payload;

      const user = await this.userRepository.findById(userId);
      if (!user) throw new Error("No user found");

      const serviceData = await this.providerServiceRepository.findProviderServiceByProviderId(new Types.ObjectId(providerId));

      function isServiceData(obj: any): obj is FindProviderServiceResponse {
        return obj && typeof obj === 'object' && '_id' in obj;
      }

      if (!isServiceData(serviceData)) {
        return { success: true, message: "Service fetched successfully.", data: {} };
      }

      const { serviceName, serviceDescription, servicePrice, serviceExperience, service } = serviceData;

      return { success: true, message: "Service provider details fetched", data: { serviceName, serviceDescription, servicePrice, serviceExperience, service } }
    } catch (error) {
      console.log("UserFetchServiceProviderServiceDetailsUseCase error : ", error);
      throw new Error("Failed to fetch service provider service details");
    }
  }
}


export class UserFetchServiceProviderServiceAvailabilityUseCase {
  constructor(
    private providerRepository: IProviderRepository,
    private userRepository: IUserRepository,
    private serviceAvailabilityRepository: IServiceAvailabilityRepository,
  ) { }

  async execute(payload: UserFetchProviderServiceAvailabilityRequest): Promise<ApiResponse<UserFetchProviderServiceAvailabilityResponse>> {
    try {
      const { userId, providerId, date } = payload;
      const currentDateTime = dayjs();
      const selectedDate = dayjs(date).format('YYYY-MM-DD');

      const user = await this.userRepository.findById(userId);
      if (!user) throw new Error("No user found");

      const provider = await this.providerRepository.findById(providerId);
      if(!provider) throw new Error("nNo provider found");
      if(!provider.serviceAvailabilityId) return null;

      const availability = await this.serviceAvailabilityRepository.findServiceAvailabilityByProviderId(date, provider.serviceAvailabilityId);
      if (availability == null) return { success: true, message: "Service availability fetched successfully.", data: {} };

      const updatedSlots = availability.slots.map((slot) => {
        const slotDateTime = dayjs(`${selectedDate} ${slot.time}`, 'YYYY-MM-DD hh:mm A');
        const isWithin2Hours = slotDateTime.diff(currentDateTime, 'minute') < 120;
        return {
          ...slot,
          available: slot.available && !isWithin2Hours
        }
      });

      return { success: true, message: "Service availability fetched successfully.", data: { ...availability, slots: updatedSlots } };
    } catch (error) {
      console.log("UserFetchServiceProviderServiceAvailabilityUseCase error : ", error);
      throw new Error("Failed to fetch service providers service availability");
    }
  }
}


export class UserFetchProvidersForChatSidebar {
  constructor(
    private bookingRepository: IBookingRepository,
    private signedUrlService: ISignedUrlService
  ) { }

  async execute(payload: UserFetchProvidersForChatSidebarRequest): Promise<ApiResponse<UserFetchProvidersForChatSidebarResponse>> {
    try {
      const { userId } = payload;

      const result = await this.bookingRepository.findProvidersforChatSideBar(userId);

      const updatedResult: UserFetchProvidersForChatSidebarResponse = await Promise.all(
        result.map(async (provider) => {
          let profileImageUrl = provider?.profileImage;

          if (profileImageUrl) {
            const signedUrl = await this.signedUrlService.generate(profileImageUrl);
            provider.profileImage = signedUrl;
          }

          return provider;
        })
      )

      return { success: true, message: "Providers fetched successfully", data: updatedResult }
    } catch (error) {
      console.log("UserFetchProvidersForChatSidebar error : ", error);
      throw new Error("Failed to fetch providers for chat sidebar");
    }
  }
}