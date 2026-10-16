import { differenceInMinutes } from "date-fns";
import { ERROR_CODES } from "../../../shared/utils/types/enums";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { defaultTimezone } from "../../../shared/utils/constants/constant";
import { BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { parseZonedSlotToUtc } from "../../../shared/utils/helpers/parseZonedSlotToUtc";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IServiceAvailabilityQueries } from "../../interfaces/queries/IServiceAvailability.queries";
import {
  GetServiceAvailabilityInput,
  GetServiceAvailabilityOutput,
} from "../../dtos/serviceAvailability.dto";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";

export class GetServiceAvailabilityUseCase {
  constructor(
    private readonly providerProfileRepository: IProviderProfileRepository,
    private readonly serviceAvailabilityQueries: IServiceAvailabilityQueries,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: GetServiceAvailabilityInput): Promise<GetServiceAvailabilityOutput> {
    try {
      const { providerId, date } = input;
      if (!providerId) {
        throw new BadRequestError();
      }

      const provider = await this.userRepository.findById(providerId);
      if (!provider) {
        throw new NotFoundError("User not found", ERROR_CODES.USER_NOT_FOUND);
      }

      const providerProfile = await this.providerProfileRepository.findByUserId(providerId);
      if (!providerProfile) {
        throw new NotFoundError("Profile not found", ERROR_CODES.PROVIDER_PROFILE_NOT_FOUND);
      }

      if (!providerProfile.serviceAvailabilityId) return null;

      const providerTimeZone = provider.timeZone?.value || defaultTimezone;

      const availability = await this.serviceAvailabilityQueries.findByProviderId({
        date,
        availabilityId: providerProfile.serviceAvailabilityId,
        timeZone: providerTimeZone,
      });

      if (!availability) return null;

      const updatedSlots = availability.slots.map((slot) => {
        const slotUtc = parseZonedSlotToUtc(date, slot.time, providerTimeZone);
        const minutesUntilSlot = differenceInMinutes(slotUtc, new Date());
        const isWithin2Hours = minutesUntilSlot < 120;

        return {
          ...slot,
          available: slot.available && !isWithin2Hours,
        };
      });

      return { ...availability, slots: updatedSlots };
    } catch (error: unknown) {
      throw toAppError(error, "Failed to get service availability");
    }
  }
}
