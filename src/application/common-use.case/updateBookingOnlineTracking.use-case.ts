import { ApiResponse, Role, UpdateBookingTrackRequest } from "../../infrastructure/dtos/common.dto";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { AppointmentStatus } from "../../domain/entities/booking.entity";

export class UpdateBookingOnlineTrakingUseCase {
    constructor(
        private bookingRepositoryImpl: BookingRepositoryImpl
    ) { }

    async execute(payload: UpdateBookingTrackRequest): Promise<ApiResponse> {

        const { joined, joinedTime, leftCallTime, role, roomId } = payload;
       if (joined === null) throw new Error("Invalid request");

        if (joined && (!joinedTime && !leftCallTime)) throw new Error("Invalid request");
        if (!role || !roomId) throw new Error("role and bookingId are required");

        const booking = await this.bookingRepositoryImpl.findBookingByroomId(roomId);
        if (!booking) throw new Error("No booking found");

        if (role === Role.provider) {
            if (joined && joinedTime) {
                booking.track.provider.joined = true;
                booking.track.provider.joinedTime = joinedTime;
            } else if (joined && leftCallTime) {
                booking.track.provider.leftCallTime = leftCallTime;
                if(booking.track.user.joined) {
                    if(booking.track.user.joinedTime && booking.track.user.leftCallTime) {
                        booking.appointmentStatus = AppointmentStatus.Completed;
                    }
                }
            }
        } else if (role === Role.user) {
            if (joined && joinedTime) {
                booking.track.user.joined = true;
                booking.track.user.joinedTime = joinedTime;
            } else if (joined && leftCallTime) {
                booking.track.user.leftCallTime = leftCallTime;
                if(booking.track.provider.joined) {
                    if(booking.track.provider.joinedTime && booking.track.provider.leftCallTime) {
                        booking.appointmentStatus = AppointmentStatus.Completed;
                    }
                }
            }
        }

        const updatedBooking = await this.bookingRepositoryImpl.updateBooking(booking);
        if(!updatedBooking) throw new Error("Something went wrong");

        return { success: true, message: "booking tracks updated" };
    }
}