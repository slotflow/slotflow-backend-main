import dayjs from "dayjs";
import {
    FindProviderServiceResponse,
    AdminFetchProviderServiceRequest,
    AdminFetchProviderDetailsRequest,
    AdminFetchProviderServiceResponse,
    AdminFetchProviderDetailsResponse,
    AdminFetchProviderServiceAvailabilityRequest,
    AdminFetchProviderServiceAvailabilityResponse,
} from "../../../infrastructure/dtos/admin.dto";
import { GenerateSignedUrlService } from "../../../infrastructure/services/signedUrl.service";
import { PaymentRepositoryImpl } from "../../../infrastructure/database/payment/payment.repository.impl";
import { ProviderRepositoryImpl } from "../../../infrastructure/database/provider/provider.repository.impl";
import { SubscriptionRepositoryImpl } from "../../../infrastructure/database/subscription/subscription.repository.impl";
import { ProviderServiceRepositoryImpl } from "../../../infrastructure/database/providerService/providerService.repository.impl";
import { ServiceAvailabilityRepositoryImpl } from "../../../infrastructure/database/serviceAvailability/serviceAvailability.repository.impl";
import { ApiResponse, FetchPaymentResponse, FetchPaymentsRequest, FetchProviderSubscriptionsRequest, FindSubscriptionsByProviderIdResponse } from "../../../infrastructure/dtos/common.dto";


export class AdminFetchProviderDetailsUseCase {
    constructor(
        private providerRepository: ProviderRepositoryImpl,
        private generateSignedUrlService: GenerateSignedUrlService
    ) { }

    async execute(payload: AdminFetchProviderDetailsRequest): Promise<ApiResponse<AdminFetchProviderDetailsResponse>> {
        try {
            const { providerId } = payload;

            const providerData = await this.providerRepository.findProviderById(providerId);
            if (providerData == null) return { success: true, message: "Provider details fetched", data: {} };

            if (providerData.profileImage) {
                providerData.profileImage = await this.generateSignedUrlService.execute(providerData.profileImage);
            }

            const { addressId, subscription, serviceId, serviceAvailabilityId, verificationToken, password, updatedAt, ...provider } = providerData;
            return { success: true, message: "Provider details fetched", data: provider };
        } catch (error) {
            console.log("AdminFetchProviderDetailsUseCase : ", error);
            throw new Error("Failed to fetch provider details");
        }
    }
}


export class AdminFetchProviderServiceUseCase {
    constructor(
        private providerRepository: ProviderRepositoryImpl,
        private providerServiceRepository: ProviderServiceRepositoryImpl,
    ) { }

    async execute(payload: AdminFetchProviderServiceRequest): Promise<ApiResponse<AdminFetchProviderServiceResponse>> {
        try {
            const { providerId } = payload;

            const provider = await this.providerRepository.findProviderById(providerId);
            if (!provider) throw new Error("No user found.");

            const serviceData = await this.providerServiceRepository.findProviderServiceByProviderId(providerId);
            function isServiceData(obj: any): obj is FindProviderServiceResponse {
                return obj && typeof obj === 'object' && '_id' in obj;
            }

            if (!isServiceData(serviceData)) {
                return { success: true, message: "Service fetched successfully.", data: {} };
            }

            const { _id, createdAt, updatedAt, ...service } = serviceData;

            return { success: true, message: "Service fetched successfully.", data: service };
        } catch (error) {
            console.log("AdminFetchProviderServiceUseCase : ", error);
            throw new Error("Failed to fetch provider service details");
        }
    }
}


export class AdminfetchProviderServiceAvailabilityUseCase {
    constructor(
        private providerRepositoryImpl: ProviderRepositoryImpl,
        private serviceAvailabilityRepositoryImpl: ServiceAvailabilityRepositoryImpl,
    ) { }

    async execute(payload: AdminFetchProviderServiceAvailabilityRequest): Promise<ApiResponse<AdminFetchProviderServiceAvailabilityResponse>> {
        try {
            const { providerId, date } = payload;

            const currentDateTime = dayjs();
            const selectedDate = dayjs(date).format('YYYY-MM-DD');

            const provider = await this.providerRepositoryImpl.findProviderById(providerId);
            if (!provider) throw new Error("No user found.");

            const availability = await this.serviceAvailabilityRepositoryImpl.findServiceAvailabilityByProviderId(providerId, date);
            if (availability == null) return { success: true, message: "Service availability fetched successfully.", data: {} };
            const updatedSlots = availability.slots.map((slot) => {
                const slotDateTime = dayjs(`${selectedDate} ${slot.time}`, 'YYYY-MM-DD hh:mm A');
                const isWithin2Hours = slotDateTime.diff(currentDateTime, 'minute') < 120;
                return {
                    ...slot,
                    available: !isWithin2Hours
                }
            });

            return { success: true, message: "Service availability fetched successfully.", data: { ...availability, slots: updatedSlots } };
        } catch (error) {
            console.log("AdminfetchProviderServiceAvailabilityUseCase : ", error);
            throw new Error("Failed to fetch provider service availability details");
        }
    }
}


export class AdminFetchProviderSubscriptionsUseCase {
    constructor(
        private providerRepositoryImpl: ProviderRepositoryImpl,
        private subscriptionRepositoryImpl: SubscriptionRepositoryImpl,
    ) { }

    async execute(payload: FetchProviderSubscriptionsRequest): Promise<ApiResponse<FindSubscriptionsByProviderIdResponse>> {
        try {
            const { providerId, page, limit } = payload;

            const provider = await this.providerRepositoryImpl.findProviderById(providerId);
            if (!provider) throw new Error("No user found.");

            const result = await this.subscriptionRepositoryImpl.findSubscriptionsByProviderId({ providerId, page, limit });
            if (!result) throw new Error("Subscriptions fetching error.");

            return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
        } catch (error) {
            console.log("AdminFetchProviderSubscriptionsUseCase : ", error);
            throw new Error("Failed to fetch provider subscriptions")
        }

    }
}


export class AdminFetchProviderPaymentsUseCase {
    constructor(
        private providerRepositoryImpl: ProviderRepositoryImpl,
        private paymentRepositoryImpl: PaymentRepositoryImpl,
    ) { }

    async execute({ providerId, page, limit }: FetchPaymentsRequest): Promise<ApiResponse<FetchPaymentResponse>> {
        try {
            if (!providerId) throw new Error("Invalid request.");

            const provider = await this.providerRepositoryImpl.findProviderById(providerId);
            if (!provider) throw new Error("No user found.");

            const result = await this.paymentRepositoryImpl.findAllPayments({ page, limit, providerId: providerId });
            if (!result) throw new Error("Payments fetching error.");

            return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
        } catch (error) {
            console.log("AdminFetchProviderPaymentsUseCase : ", error);
            throw new Error("Failed to fetch provider payments");
        }
    }
}
