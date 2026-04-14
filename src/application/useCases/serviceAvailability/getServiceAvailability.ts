import dayjs from '../../../shared/config/dayjs';
import { log } from "../../../shared/logger/logger";
import { IServiceAvailabilityQueries } from "../../queries/IServiceAvailability.queries";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";
import { GetServiceAvailabilityInput, GetServiceAvailabilityOutput } from "../../dtos/serviceAvailability.dto";

export class GetServiceAvailabilityUseCase {
  constructor(
    private providerProfileRepository: IProviderProfileRepository,
    private serviceAvailabilityQueries: IServiceAvailabilityQueries
  ) { };

  async execute(input: GetServiceAvailabilityInput): Promise<GetServiceAvailabilityOutput> {
    try {
      const { providerId, date } = input;
      const currentDateTime = dayjs();
      const selectedDate = dayjs(date).format('YYYY-MM-DD');

      const providerProfile = await this.providerProfileRepository.findById(providerId);
      if (!providerProfile) throw new Error("Profile not found");
      if (!providerProfile.serviceAvailabilityId) return null;

      const availability = await this.serviceAvailabilityQueries.findByProviderId({ date, availabilityId: providerProfile.serviceAvailabilityId });
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