import { log } from "../../../shared/logger/logger";
import { IServiceAvailabilityQueries } from "../../queries/IServiceAvailability.queries";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { UpdateBookingOnlineTrackRequest, UpdateBookingOnlineTrackResponse } from "../../dtos/common.dto";
import { Role } from "../../../domain/enums/common.enum";

export class UpdateBookingOnlineTrakingUseCase {
    constructor(
        private bookingRepository: IBookingRepository,
        private serviceAvailabilityQueries: IServiceAvailabilityQueries
    ) { };

    async execute(payload: UpdateBookingOnlineTrackRequest): Promise<UpdateBookingOnlineTrackResponse> {
        try {
            const { joined, joinedTime, leftCallTime, role, roomId } = payload;
            if (joined === null) throw new Error("Invalid request");

            if (joined && (!joinedTime && !leftCallTime)) throw new Error("Invalid request");
            if (!role || !roomId) throw new Error("role and bookingId are required");

            const booking = await this.bookingRepository.findByroomId(roomId);
            if (!booking) throw new Error("No booking found");

            const serviceAvailability = await this.serviceAvailabilityQueries.findByProviderId(new Date(), booking.serviceProviderId);
            if (!serviceAvailability) throw new Error("No service found");

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
        } catch (error) {
            log.error("UpdateBookingOnlineTrakingUseCase failed", error as Error);
            throw error;
        };
    };
};