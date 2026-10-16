import { Role } from "../../../domain/enums/common.enum";
import { subMinutes } from "date-fns";
import { ValidateJoinRoomInput } from "../../dtos/booking.dto";
import { ERROR_CODES } from "../../../shared/utils/types/enums";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../../shared/error/appError";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";

export class ValidateJoinRoomUsecase {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(input: ValidateJoinRoomInput): Promise<void> {
    try {
      const { bookingId, roomId, userId, role } = input;
      if (!bookingId || !roomId || !userId || !role) {
        throw new BadRequestError();
      }

      const booking = await this.bookingRepository.findById(bookingId);
      if (!booking) {
        throw new NotFoundError("Booking not found", ERROR_CODES.BOOKING_NOT_FOUND);
      }

      if (booking.appointmentStatus !== AppointmentStatus.CONFIRMED) {
        throw new BadRequestError("Booking is not confirmed", ERROR_CODES.BOOKING_NOT_CONFIRMED);
      }

      if (booking.videoCallRoomId !== roomId) {
        throw new BadRequestError("Invalid room ID for this booking", ERROR_CODES.INVALID_REQUEST);
      }

      if (role === Role.USER) {
        if (String(booking.userId) !== String(userId)) {
          throw new ForbiddenError(
            "You are not authorized for this booking",
            ERROR_CODES.UNAUTHORIZED,
          );
        }
      } else if (role === Role.PROVIDER) {
        if (String(booking.serviceProviderId) !== String(userId)) {
          throw new ForbiddenError(
            "You are not authorized for this booking provider",
            ERROR_CODES.UNAUTHORIZED,
          );
        }
      } else {
        throw new BadRequestError();
      }

      // For testin we need to comment the below code

      const now = new Date();
      const sessionStartTime = new Date(booking.sessionStartTime);
      const sessionEndTime = new Date(booking.sessionEndTime);
      const earliestStartGraceMinutes: number = 15;
      const earliestAllowedJoinTime = subMinutes(sessionStartTime, earliestStartGraceMinutes);

      if (now < earliestAllowedJoinTime) {
        throw new BadRequestError(
          `You can only join the call up to ${earliestStartGraceMinutes} minutes before the scheduled start time`,
          ERROR_CODES.INVALID_REQUEST,
        );
      }

      if (now > sessionEndTime) {
        throw new BadRequestError("This video call session has ended", ERROR_CODES.INVALID_REQUEST);
      }
    } catch (error: unknown) {
      throw toAppError(error, "Failed to validate room");
    }
  }
}
