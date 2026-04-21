import { Role } from "../../../domain/enums/common.enum";
import { ERROR_CODES } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { IServiceAvailabilityQueries } from "../../queries/IServiceAvailability.queries";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { UpdateBookingOnlineTrackInput, UpdateBookingOnlineTrackOutput } from "../../dtos/booking.dto";

export class UpdateBookingOnlineTrakingUseCase {
    constructor(
        private readonly bookingRepository: IBookingRepository,
        private readonly serviceAvailabilityQueries: IServiceAvailabilityQueries
    ) { };

    async execute(input: UpdateBookingOnlineTrackInput): Promise<UpdateBookingOnlineTrackOutput> {
        try {
            const { joined, joinedTime, leftCallTime, role, roomId } = input;

            if (joined && (!joinedTime && !leftCallTime)) {
                throw new BadRequestError();
            }

            if (!role || !roomId) {
                throw new BadRequestError();
            }

            const booking = await this.bookingRepository.findByRoomId(roomId);
            if (!booking) {
                throw new NotFoundError(
                    "Booking not found",
                    ERROR_CODES.BOOKING_NOT_FOUND
                );
            }

            const serviceAvailability = await this.serviceAvailabilityQueries.findByProviderId({ date: new Date(), providerId: booking.serviceProviderId });
            if (!serviceAvailability) {
                throw new NotFoundError(
                    "Service not found",
                    ERROR_CODES.SERVICE_NOT_FOUND
                );
            }

            if (role === Role.PROVIDER) {
                if (joined && joinedTime) {
                    if (!booking.onlineTrack.provider.joined && booking.onlineTrack.provider.joinedTime) {
                        booking.onlineTrack.provider.joined = true;
                        booking.onlineTrack.provider.joinedTime = joinedTime;
                    }
                } else if (joined && leftCallTime) {
                    booking.onlineTrack.provider.leftCallTime = leftCallTime;
                    if (booking.onlineTrack.user.joined) {
                        if (booking.onlineTrack.user.joinedTime && booking.onlineTrack.user.leftCallTime) {
                            booking.completeAppointment();
                        };
                    };
                };
            } else if (role === Role.USER) {
                if (joined && joinedTime) {
                    if (!booking.onlineTrack.user.joined && !booking.onlineTrack.user.joinedTime) {
                        booking.onlineTrack.user.joined = true;
                        booking.onlineTrack.user.joinedTime = joinedTime;
                    }
                } else if (joined && leftCallTime) {
                    booking.onlineTrack.user.leftCallTime = leftCallTime;
                    if (booking.onlineTrack.provider.joined) {
                        if (booking.onlineTrack.provider.joinedTime && booking.onlineTrack.provider.leftCallTime) {
                            booking.completeAppointment();
                        };
                    };
                };
            };

            await this.bookingRepository.update(booking);

            return { duration: serviceAvailability.duration };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to update booking");
        };
    };
};