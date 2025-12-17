import dayjs from "dayjs";
import {
    FindProviderServiceResponse,
    AdminFetchProviderServiceRequest,
    AdminFetchProviderDetailsRequest,
    AdminFetchProviderServiceResponse,
    AdminFetchProviderDetailsResponse,
    AdminFetchProviderServiceAvailabilityRequest,
    AdminFetchProviderServiceAvailabilityResponse,
} from "../../dtos/admin.dto";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";
import { IProviderServiceRepository } from "../../../domain/interfaces/repositories/IProviderService.repository";
import { IServiceAvailabilityRepository } from "../../../domain/interfaces/repositories/IServiceAvailability.repository";
import { ApiResponse, FetchPaymentResponse, FetchPaymentsRequest, FetchProviderSubscriptionsRequest, FindSubscriptionsByProviderIdResponse } from "../../dtos/common.dto";


export class AdminFetchProviderDetailsUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private signedUrlService: ISignedUrlService
    ) { }

    async execute(payload: AdminFetchProviderDetailsRequest): Promise<ApiResponse<AdminFetchProviderDetailsResponse>> {
        try {
            const { providerId } = payload;

            const providerData = await this.providerRepository.findProviderById(providerId);
            if (providerData == null) return { success: true, message: "Provider details fetched", data: {} };

            if (providerData.profileImage) {
                providerData.profileImage = await this.signedUrlService.generate(providerData.profileImage);
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
        private providerRepository: IProviderRepository,
        private providerServiceRepository: IProviderServiceRepository,
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
        private providerRepository: IProviderRepository,
        private serviceAvailabilityRepository: IServiceAvailabilityRepository,
    ) { }

    async execute(payload: AdminFetchProviderServiceAvailabilityRequest): Promise<ApiResponse<AdminFetchProviderServiceAvailabilityResponse>> {
        try {
            const { providerId, date } = payload;

            const currentDateTime = dayjs();
            const selectedDate = dayjs(date).format('YYYY-MM-DD');

            const provider = await this.providerRepository.findProviderById(providerId);
            if (!provider) throw new Error("No user found.");

            const availability = await this.serviceAvailabilityRepository.findServiceAvailabilityByProviderId(providerId, date, provider.serviceAvailabilityId);
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
        private providerRepository: IProviderRepository,
        private subscriptionRepository: ISubscriptionRepository,
    ) { }

    async execute(payload: FetchProviderSubscriptionsRequest): Promise<ApiResponse<FindSubscriptionsByProviderIdResponse>> {
        try {
            const { providerId, page, limit } = payload;

            const provider = await this.providerRepository.findProviderById(providerId);
            if (!provider) throw new Error("No user found.");

            const result = await this.subscriptionRepository.findSubscriptionsByProviderId({ providerId, page, limit });
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
        private providerRepository: IProviderRepository,
        private paymentRepository: IPaymentRepository,
    ) { }

    async execute({ providerId, page, limit }: FetchPaymentsRequest): Promise<ApiResponse<FetchPaymentResponse>> {
        try {
            if (!providerId) throw new Error("Invalid request.");

            const provider = await this.providerRepository.findProviderById(providerId);
            if (!provider) throw new Error("No user found.");

            const result = await this.paymentRepository.findAllPayments({ page, limit, providerId: providerId });
            if (!result) throw new Error("Payments fetching error.");

            return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
        } catch (error) {
            console.log("AdminFetchProviderPaymentsUseCase : ", error);
            throw new Error("Failed to fetch provider payments");
        }
    }
}
