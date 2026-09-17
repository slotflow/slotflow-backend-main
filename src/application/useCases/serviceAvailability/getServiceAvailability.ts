import { ERROR_CODES } from '../../../shared/utils/types/enums';
import { differenceInMinutes, format, parse } from 'date-fns';
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

      const currentDateTime = new Date();
      const parsedDate = date instanceof Date ? date : new Date(date);
      const selectedDateStr = format(parsedDate, 'yyyy-MM-dd');

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

      const updatedSlots = availability.slots.map((slot) => {
        const slotDateTime = parse(
          `${selectedDateStr} ${slot.time}`,
          'yyyy-MM-dd hh:mm a',
          new Date()
        );
        const minutesUntilSlot = differenceInMinutes(slotDateTime, currentDateTime);
        const isWithin2Hours = minutesUntilSlot < 120;
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