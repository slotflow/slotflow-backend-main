import dayjs from '../../../shared/config/dayjs';
import { ERROR_CODES } from '../../../shared/utils/types';
import { toAppError } from '../../../shared/error/handleUnknownError';
import { BadRequestError, NotFoundError } from '../../../shared/error/appError';
import { IServiceAvailabilityQueries } from "../../queries/IServiceAvailability.queries";
import { GetServiceAvailabilityInput, GetServiceAvailabilityOutput } from "../../dtos/serviceAvailability.dto";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";

export class GetServiceAvailabilityUseCase {
  constructor(
    private readonly providerProfileRepository: IProviderProfileRepository,
    private readonly serviceAvailabilityQueries: IServiceAvailabilityQueries
  ) { };

  async execute(input: GetServiceAvailabilityInput): Promise<GetServiceAvailabilityOutput> {
    try {
      const { providerId, date } = input;
      if (!providerId) {
        throw new BadRequestError();
      }

      const currentDateTime = dayjs();
      const selectedDate = dayjs(date).format('YYYY-MM-DD');

      const providerProfile = await this.providerProfileRepository.findByUserId(providerId);
      if (!providerProfile) {
        throw new NotFoundError(
          "Profile not found",
          ERROR_CODES.PROVIDER_PROFILE_NOT_FOUND
        );
      }

      if (!providerProfile.serviceAvailabilityId) return null;

      const availability = await this.serviceAvailabilityQueries.findByProviderId({ date, availabilityId: providerProfile.serviceAvailabilityId });
      if (!availability) return null;
      console.log("availability : ",availability)

      const updatedSlots = availability.slots.map((slot) => {
        const slotDateTime = dayjs(`${selectedDate} ${slot.time}`, 'YYYY-MM-DD hh:mm A');
        const isWithin2Hours = slotDateTime.diff(currentDateTime, 'minute') < 120;
        return {
          ...slot,
          available: slot.available && !isWithin2Hours
        }
      });

      return { ...availability, slots: updatedSlots };
    } catch (error: unknown) {
      throw toAppError(error, "Failed to get service availability");
    };
  };
};