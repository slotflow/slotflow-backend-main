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
import { IProviderServiceQueries } from "../../queries/IProviderService.queries";
import { IServiceAvailabilityQueries } from "../../queries/IServiceAvailability.queries";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";


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
