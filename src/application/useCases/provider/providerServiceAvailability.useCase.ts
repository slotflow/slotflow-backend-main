import dayjs from "dayjs";
import {
    ProviderAddServiceAvailabilityRewuest,
    ProviderFetchServiceAvailabilityRequest,
    ProviderFetchServiceAvailabilityResponse,
} from "../../dtos/provider.dto";
import { log } from "../../../shared/logger/logger";
import { IServiceAvailabilityQueries } from "../../queries/IServiceAvailability.queries";
import { ServiceAvailability } from "../../../domain/entities/serviceAvailability.entity";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { FrontendAvailabilityForRequest, FrontendAvailabilityUpdatedSlots } from "../../dtos/common.dto";
import { IServiceAvailabilityRepository } from "../../../domain/interfaces/repositories/IServiceAvailability.repository";


export class ProviderCreateServiceAvailabilitiesUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private serviceAvailabilityRepository: IServiceAvailabilityRepository,
    ) { };

    async execute(payload: ProviderAddServiceAvailabilityRewuest): Promise<void> {
        try {
            const { providerId, availabilities } = payload;
            if (!providerId || !availabilities || availabilities.length === 0) throw new Error("Invalid request.");


            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("Please logout and try again.");

            const newAvailabilities: FrontendAvailabilityUpdatedSlots[] = availabilities.map((availability: FrontendAvailabilityForRequest) => ({
                ...availability,
                slots: availability.slots.map((slot: string) => ({
                    time: slot
                }))
            }));

            const serviceAvailabilityData = ServiceAvailability.create({
                providerId,
                availabilities: newAvailabilities
            });

            const serviceAvailability = await this.serviceAvailabilityRepository.create(serviceAvailabilityData);
            if (!serviceAvailability) throw new Error("Service availability saving failed.");

            if (provider && serviceAvailability && serviceAvailability._id) {
                provider.attachServiceAvailability(serviceAvailability._id);
                const updatedProvider = await this.providerRepository.update(provider);
                if (!updatedProvider) throw new Error("Failed to update provider with service availability in profile.");
            };

        } catch (error) {
            log.error("ProviderCreateServiceAvailabilitiesUseCase failed", error as Error);
            throw error;
        };
    };
};


export class ProviderFetchServiceAvailabilityUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private serviceAvailabilityQueries: IServiceAvailabilityQueries
    ) { };

    async execute(payload: ProviderFetchServiceAvailabilityRequest): Promise<ProviderFetchServiceAvailabilityResponse> {
        try {
            const { providerId, date } = payload;
            if (!providerId || !date) throw new Error("Invalid request.");

            const currentDateTime = dayjs();
            const selectedDate = dayjs(date).format('YYYY-MM-DD');

            const provider = await this.providerRepository.findById(providerId);
            if(!provider) throw new Error("No user found");
            if(!provider.serviceAvailabilityId) return null;

            const availability = await this.serviceAvailabilityQueries.findByProviderId(date , provider.serviceAvailabilityId);
            if (!availability) return null;
            // console.log("availability : ",availability);

            const updatedSlots = availability.slots.map((slot) => {
                const slotDateTime = dayjs(`${selectedDate} ${slot.time}`, 'YYYY-MM-DD hh:mm A');
                const isWithin2Hours = slotDateTime.diff(currentDateTime, 'minute') < 120;
                return {
                    ...slot,
                    available: !isWithin2Hours
                };
            });

            // console.log("updatedSlots : ",updatedSlots);

            return { ...availability, slots: updatedSlots };
        } catch (error) {
            log.error("ProviderFetchServiceAvailabilityUseCase failed", error as Error);
            throw error;
        };
    };
};