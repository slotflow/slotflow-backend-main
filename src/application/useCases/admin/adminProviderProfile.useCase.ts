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
import { IServiceAvailabilityQueries } from "../../queries/IServiceAvailability.queries";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { IProviderServiceQueries } from "../../queries/IProviderService.queries";


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
                signedProfileImageUrl = await this.signedUrlService.get(providerData.profileImage);
            };

            return {
                _id: providerData._id,
                adminVerificationStatus: providerData.adminVerificationStatus,
                createdAt: providerData.createdAt,
                email: providerData.email,
                isAddressVerified: providerData.isAddressVerified,
                isAdminVerified: providerData.isAdminVerified,
                isAvailabilityVerified: providerData.isAvailabilityVerified,
                isBlocked: providerData.isBlocked,
                isEmailVerified: providerData.isEmailVerified,
                isProofsVerified: providerData.isProofsVerified,
                isServiceDetailsVerified: providerData.isServiceDetailsVerified,
                phone: providerData.phone,
                trustedBySlotflow: providerData.trustedBySlotflow,
                username: providerData.username,
                profileImage: signedProfileImageUrl,
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

            return {...service};
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
                    available: !isWithin2Hours,
                };
            });

            return { ...availability, slots: updatedSlots };
        } catch (error) {
            log.error("AdminfetchProviderServiceAvailabilityUseCase failed", error as Error);
            throw error;
        };
    };
};
