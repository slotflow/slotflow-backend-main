import dayjs from '../../../shared/config/dayjs';
import { log } from "../../../shared/logger/logger";
import { IServiceAvailabilityQueries } from "../../queries/IServiceAvailability.queries";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { FetchServiceAvailabilityRequest, FetchServiceAvailabilityResponse } from "../../dtos/serviceAvailability.dto";

export class GetServiceAvailabilityUseCase {
  constructor(
    private providerRepository: IProviderRepository,
    private serviceAvailabilityQueries: IServiceAvailabilityQueries
  ) { };

  async execute(payload: FetchServiceAvailabilityRequest): Promise<FetchServiceAvailabilityResponse> {
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
      log.error("GetServiceAvailabilityUseCase failed", error as Error);
      throw error;
    };
  };
};