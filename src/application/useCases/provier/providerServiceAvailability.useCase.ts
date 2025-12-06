import dayjs from "dayjs";
import { Types } from "mongoose";
import {
    ProviderAddServiceAvailabilityRewuest,
    ProviderFetchServiceAvailabilityRequest,
    ProviderFetchServiceAvailabilityResponse,
} from "../../../infrastructure/dtos/provider.dto";
import { ApiResponse } from "../../../infrastructure/dtos/common.dto";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { IServiceAvailabilityRepository } from "../../../domain/interfaces/repositories/IServiceAvailability.repository";
import { FrontendAvailabilityForRequest, FrontendAvailabilityUpdatedSlots } from "../../../domain/entities/serviceAvailability.entity";


export class ProviderCreateServiceAvailabilitiesUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private serviceAvailabilityRepository: IServiceAvailabilityRepository,
    ) { }

    async execute(payload: ProviderAddServiceAvailabilityRewuest): Promise<ApiResponse> {
        try {
            const { providerId, availabilities } = payload;
            if (!providerId || !availabilities || availabilities.length === 0) throw new Error("Invalid request.");

            const convertedProviderId = new Types.ObjectId(providerId);
            const provider = await this.providerRepository.findProviderById(new Types.ObjectId(providerId));
            if (!provider) throw new Error("Please logout and try again.");

            const newAvailabilities: FrontendAvailabilityUpdatedSlots[] = availabilities.map((availability: FrontendAvailabilityForRequest) => ({
                ...availability,
                slots: availability.slots.map((slot: string) => ({
                    time: slot
                }))
            }));

            const serviceAvailability = await this.serviceAvailabilityRepository.createServiceAvailabilities(convertedProviderId, newAvailabilities);
            if (!serviceAvailability) throw new Error("Service availability saving failed.");

            if (provider && serviceAvailability && serviceAvailability._id) {
                provider.serviceAvailabilityId = serviceAvailability._id;
                const updatedProvider = await this.providerRepository.updateProvider(provider);
                if (!updatedProvider) throw new Error("Failed to update provider with service availability in profile.");
            }

            return { success: true, message: "Service availability saved successfuly." };
        } catch (error) {
            console.log("ProviderCreateServiceAvailabilitiesUseCase error :", error);
            throw new Error("Failed to create service availabilities.");
        }
    }
}


export class ProviderFetchServiceAvailabilityUseCase {
    constructor(
        private serviceAvailabilityRepository: IServiceAvailabilityRepository
    ) { }

    async execute(payload: ProviderFetchServiceAvailabilityRequest): Promise<ApiResponse<ProviderFetchServiceAvailabilityResponse>> {
        try {
            const { providerId, date } = payload;
            if (!providerId || !date) throw new Error("Invalid request.");

            const currentDateTime = dayjs();
            const selectedDate = dayjs(date).format('YYYY-MM-DD');

            const availability = await this.serviceAvailabilityRepository.findServiceAvailabilityByProviderId(
                new Types.ObjectId(providerId),
                new Date(date)
            );

            if (availability === null) return { success: true, message: "Provider service availability not yet added.", data: {} };
            if (!availability) throw new Error("Provider service availability fetching error.");

            const updatedSlots = availability.slots.map((slot) => {
                const slotDateTime = dayjs(`${selectedDate} ${slot.time}`, 'YYYY-MM-DD hh:mm A');
                const isWithin2Hours = slotDateTime.diff(currentDateTime, 'minute') < 120;
                return {
                    ...slot,
                    available: !isWithin2Hours
                }
            });

            return {
                success: true,
                message: "Provider service availability fetched.",
                data: { ...availability, slots: updatedSlots }
            };
        } catch (error) {
            console.log("ProviderFetchServiceAvailabilityUseCase error :", error);
            throw new Error("Failed to fetch provider service availability.");
        }
    }
}