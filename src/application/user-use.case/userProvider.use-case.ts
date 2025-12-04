import dayjs from "dayjs";
import { Types } from "mongoose";
import {
  FindProviderServiceResponse,
  UserFetchProviderServiceResponse,
  UserFetchServiceProvidersResponse,
  UserFetchServiceProvidersRequest,
  UserFetchServiceProviderAddressRequest,
  UserFetchServiceProviderDetailsRequest,
  UserFetchServiceproviderServiceRequest,
  UserFetchServiceProviderDetailsResponse,
  UserFetchServiceProviderAddressResponse,
  UserFetchProvidersForChatSidebarRequest,
  UserFetchProvidersForChatSidebarResponse,
  UserFetchProviderServiceAvailabilityRequest,
  FindProvidersUsingServiceCategoryIdsResponse,
  UserFetchProviderServiceAvailabilityResponse,
} from "../../infrastructure/dtos/user.dto";
import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { GenerateSignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { AddressRepositoryImpl } from "../../infrastructure/database/address/address.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { ProviderServiceRepositoryImpl } from "../../infrastructure/database/providerService/providerService.repository.impl";
import { ServiceAvailabilityRepositoryImpl } from "../../infrastructure/database/serviceAvailability/serviceAvailability.repository.impl";


export class UserFetchServiceProvidersUseCase {
  constructor(
    private userRepositoryImpl: UserRepositoryImpl,
    private providerServiceRepositoryImpl: ProviderServiceRepositoryImpl,
    private generateSignedUrlService: GenerateSignedUrlService
  ) { }

  async execute(payload: UserFetchServiceProvidersRequest): Promise<ApiResponse<Array<UserFetchServiceProvidersResponse>>> {
    try {
      const { userId, serviceIds } = payload;
      if (!userId || !serviceIds) throw new Error("Invalid request.");

      const user = await this.userRepositoryImpl.findUserById(new Types.ObjectId(userId));
      if (!user) throw new Error("No user found");

      const providers = await this.providerServiceRepositoryImpl.findProvidersUsingServiceCategoryIds(serviceIds);
      if (!providers) throw new Error("Providers fetching error.");

      const updatedproviders: FindProvidersUsingServiceCategoryIdsResponse[] = await Promise.all(
        providers.map(async (provider) => {
          let profileImageUrl = provider?.provider?.profileImage;

          if (profileImageUrl) {
            const signedUrl = await this.generateSignedUrlService.execute(profileImageUrl);
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
    private userRepositoryImpl: UserRepositoryImpl,
    private providerRepositoryImpl: ProviderRepositoryImpl,
    private generateSignedUrlService: GenerateSignedUrlService
  ) { }

  async execute(payload: UserFetchServiceProviderDetailsRequest): Promise<ApiResponse<UserFetchServiceProviderDetailsResponse>> {
    try {
      const { userId, providerId } = payload;
      if (!userId || !providerId) throw new Error("Invalid request");

      const user = await this.userRepositoryImpl.findUserById(new Types.ObjectId(userId));
      if (!user) throw new Error("No user found");

      const provider = await this.providerRepositoryImpl.findProviderById(new Types.ObjectId(providerId));
      if (!provider) throw new Error("No provider found");

      if (provider.profileImage) {
        const signedUrl = await this.generateSignedUrlService.execute(provider.profileImage);
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
    private userRepositoryImpl: UserRepositoryImpl,
    private addressRepositoryImpl: AddressRepositoryImpl,
  ) { }

  async execute(payload: UserFetchServiceProviderAddressRequest): Promise<ApiResponse<UserFetchServiceProviderAddressResponse>> {
    try {
      const { userId, providerId } = payload;
      if (!userId || !providerId) throw new Error("Invalid request");

      const user = await this.userRepositoryImpl.findUserById(new Types.ObjectId(userId));
      if (!user) throw new Error("No user found");

      const address = await this.addressRepositoryImpl.findAddressByUserId(new Types.ObjectId(providerId));
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
    private userRepositoryImpl: UserRepositoryImpl,
    private providerServiceRepositoryImpl: ProviderServiceRepositoryImpl,
  ) { }

  async execute(payload: UserFetchServiceproviderServiceRequest): Promise<ApiResponse<UserFetchProviderServiceResponse>> {
    try {
      const { userId, providerId } = payload;

      const user = await this.userRepositoryImpl.findUserById(new Types.ObjectId(userId));
      if (!user) throw new Error("No user found");

      const serviceData = await this.providerServiceRepositoryImpl.findProviderServiceByProviderId(new Types.ObjectId(providerId));

      function isServiceData(obj: any): obj is FindProviderServiceResponse {
        return obj && typeof obj === 'object' && '_id' in obj;
      }

      if (!isServiceData(serviceData)) {
        return { success: true, message: "Service fetched successfully.", data: {} };
      }

      const { serviceName, serviceDescription, servicePrice, serviceExperience, serviceCategory } = serviceData;

      return { success: true, message: "Service provider address fetched", data: { serviceName, serviceDescription, servicePrice, serviceExperience, serviceCategory } }
    } catch (error) {
      console.log("UserFetchServiceProviderServiceDetailsUseCase error : ", error);
      throw new Error("Failed to fetch service provider service details");
    }
  }
}


export class UserFetchServiceProviderServiceAvailabilityUseCase {
  constructor(
    private userRepositoryImpl: UserRepositoryImpl,
    private serviceAvailabilityRepositoryImpl: ServiceAvailabilityRepositoryImpl,
  ) { }

  async execute(payload: UserFetchProviderServiceAvailabilityRequest): Promise<ApiResponse<UserFetchProviderServiceAvailabilityResponse>> {
    try {
      const { userId, providerId, date } = payload;
      const currentDateTime = dayjs();
      const selectedDate = dayjs(date).format('YYYY-MM-DD');

      const user = await this.userRepositoryImpl.findUserById(new Types.ObjectId(userId));
      if (!user) throw new Error("No user found");

      const availability = await this.serviceAvailabilityRepositoryImpl.findServiceAvailabilityByProviderId(new Types.ObjectId(providerId), date);
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
    private bookingRepositoryImpl: BookingRepositoryImpl,
    private generateSignedUrlService: GenerateSignedUrlService
  ) { }

  async execute(payload: UserFetchProvidersForChatSidebarRequest): Promise<ApiResponse<UserFetchProvidersForChatSidebarResponse>> {
    try {
      const { userId } = payload;

      const result = await this.bookingRepositoryImpl.findProvidersforChatSideBar(userId);

      const updatedResult: UserFetchProvidersForChatSidebarResponse = await Promise.all(
        result.map(async (provider) => {
          let profileImageUrl = provider?.profileImage;

          if (profileImageUrl) {
            const signedUrl = await this.generateSignedUrlService.execute(profileImageUrl);
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