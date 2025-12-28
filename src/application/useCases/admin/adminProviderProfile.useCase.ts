import dayjs from "dayjs";
import {
    AdminFetchProviderServiceRequest,
    AdminFetchProviderDetailsRequest,
    AdminFetchProviderServiceResponse,
    AdminFetchProviderDetailsResponse,
    AdminFetchProviderServiceAvailabilityRequest,
    AdminFetchProviderServiceAvailabilityResponse,
} from "../../dtos/admin.dto";
import { log } from "../../../shared/logger/logger";
import { ISubscriptionQueries } from "../../queries/ISubscription.queries";
import { IProviderServiceQueries } from "../../queries/IProviderService.queries";
import { IServiceAvailabilityQueries } from "../../queries/IServiceAvailability.queries";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { FetchPaymentResponse, FetchPaymentsRequest, FetchProviderSubscriptionsRequest, FindSubscriptionsByProviderIdResponse, TableData } from "../../dtos/common.dto";


export class AdminFetchProviderDetailsUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private signedUrlService: ISignedUrlService
    ) { };

    async execute(payload: AdminFetchProviderDetailsRequest): Promise<AdminFetchProviderDetailsResponse> {
        try {
            const { providerId } = payload;

            const providerData = await this.providerRepository.findById(providerId);
            if (!providerData) return null;

            let signedProfileImageUrl: string | null = null;
            if (providerData.profileImage) {
                signedProfileImageUrl = await this.signedUrlService.save(providerData.profileImage);
            }

            return {
                _id: providerData._id,
                createdAt: providerData.createdAt,
                email: providerData.email,
                isAdminVerified: providerData.isAdminVerified,
                isBlocked: providerData.isBlocked,
                isEmailVerified: providerData.isEmailVerified,
                phone: providerData.phone,
                profileImage: signedProfileImageUrl,
                trustedBySlotflow: providerData.trustedBySlotflow,
                username: providerData.username,
                isAddressVerified: providerData.isAddressVerified,
                isAvailabilityVerified: providerData.isAvailabilityVerified,
                isProofsVerified: providerData.isProofsVerified,
                isServiceDetailsVerified: providerData.isServiceDetailsVerified,
                adminVerificationStatus: providerData.adminVerificationStatus
            };

        } catch (error) {
            log.error("AdminFetchProviderDetailsUseCase failed", error as Error);
            throw error;
        };
    };
};


export class AdminFetchProviderServiceUseCase {
    constructor(
        private providerServiceQueries: IProviderServiceQueries,
    ) { };

    async execute(payload: AdminFetchProviderServiceRequest): Promise<AdminFetchProviderServiceResponse> {
        try {
            const { providerId } = payload;

            const service = await this.providerServiceQueries.findByProviderId(providerId);
            if (!service) return null;

            return {
                _id: service._id,
                createdAt: service.createdAt,
                isGroupService: service.isGroupService,
                maxParticipants: service.maxParticipants,
                providerId: service.providerId,
                requirements: service.requirements,
                service: service.service,
                serviceDescription: service.serviceDescription,
                serviceExperience: service.serviceExperience,
                serviceMode: service.serviceMode,
                serviceName: service.serviceName,
                servicePrice: service.servicePrice,
                serviceType: service.serviceType,
                tags: service.tags,
                updatedAt: service.updatedAt,
                videoUrl: service.videoUrl
            };
        } catch (error) {
            log.error("AdminFetchProviderServiceUseCase failed", error as Error);
            throw error;
        };
    };
};


export class AdminfetchProviderServiceAvailabilityUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private serviceAvailabilityQueries: IServiceAvailabilityQueries,
    ) { };

    async execute(payload: AdminFetchProviderServiceAvailabilityRequest): Promise<AdminFetchProviderServiceAvailabilityResponse> {
        try {
            const { providerId, date } = payload;

            const currentDateTime = dayjs();
            const selectedDate = dayjs(date).format('YYYY-MM-DD');

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("No user found.");

            if (!provider.serviceAvailabilityId) return null;

            const availability = await this.serviceAvailabilityQueries.findByProviderId(date, provider.serviceAvailabilityId);
            if (!availability) return null;

            const updatedSlots = availability.slots.map((slot) => {
                const slotDateTime = dayjs(`${selectedDate} ${slot.time}`, 'YYYY-MM-DD hh:mm A');
                const isWithin2Hours = slotDateTime.diff(currentDateTime, 'minute') < 120;
                return {
                    ...slot,
                    available: !isWithin2Hours
                }
            });

            return { ...availability, slots: updatedSlots };
        } catch (error) {
            log.error("AdminfetchProviderServiceAvailabilityUseCase failed", error as Error);
            throw error;
        };
    };
};


export class AdminFetchProviderSubscriptionsUseCase {
    constructor(
        private subscriptionQueries: ISubscriptionQueries
    ) { };

    async execute(payload: FetchProviderSubscriptionsRequest): Promise<TableData<FindSubscriptionsByProviderIdResponse>> {
        try {
            const { providerId, page, limit } = payload;

            const result = await this.subscriptionQueries.findByProviderId({ providerId, page, limit });
            const { data: subscriptions, currentPage, totalCount, totalPages } = result;

            return {
                data: subscriptions,
                totalPages,
                currentPage,
                totalCount,
            };
        } catch (error) {
            log.error("AdminFetchProviderSubscriptionsUseCase failed", error as Error);
            throw error;
        };
    };
};


export class AdminFetchProviderPaymentsUseCase {
    constructor(
        private paymentRepository: IPaymentRepository,
    ) { };

    async execute(payload: FetchPaymentsRequest): Promise<TableData<FetchPaymentResponse>> {
        try {
            const { providerId, page, limit } = payload;
            if (!providerId) throw new Error("Invalid request.");

            const result = await this.paymentRepository.findAll(page, limit, providerId);
            const { data: payments, currentPage, totalCount, totalPages } = result;

            return {
                data: payments.map(payment => ({
                    _id: payment._id,
                    createdAt: payment.createdAt,
                    discountAmount: payment.discountAmount,
                    paymentFor: payment.paymentFor,
                    paymentGateway: payment.paymentGateway,
                    paymentMethod: payment.paymentMethod,
                    paymentStatus: payment.paymentStatus,
                    totalAmount: payment.totalAmount
                })),
                totalPages,
                currentPage,
                totalCount,
            };
        } catch (error) {
            log.error("AdminFetchProviderPaymentsUseCase failed", error as Error);
            throw error;
        };
    };
};
