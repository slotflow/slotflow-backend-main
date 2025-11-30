import { roleArray } from "../../infrastructure/helpers/constants";
import { AppointmentStatus } from "../../domain/entities/booking.entity";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ServiceAvailabilityRepositoryImpl } from "../../infrastructure/database/serviceAvailability/serviceAvailability.repository.impl";
import { ApiResponse, UpdateBookingOnlineTrackRequest, UpdateBookingOnlineTrackResponse } from "../../infrastructure/dtos/common.dto";

export class UpdateBookingOnlineTrakingUseCase {
    constructor(
        private bookingRepositoryImpl: BookingRepositoryImpl,
        private serviceAvailabilityRepositoryImpl: ServiceAvailabilityRepositoryImpl,
    ) { }

    async execute(payload: UpdateBookingOnlineTrackRequest): Promise<ApiResponse<UpdateBookingOnlineTrackResponse>> {
        try {
            const { joined, joinedTime, leftCallTime, role, roomId } = payload;
            if (joined === null) throw new Error("Invalid request");

            if (joined && (!joinedTime && !leftCallTime)) throw new Error("Invalid request");
            if (!role || !roomId) throw new Error("role and bookingId are required");

            const booking = await this.bookingRepositoryImpl.findBookingByroomId(roomId);
            if (!booking) throw new Error("No booking found");

            const serviceAvailability = await this.serviceAvailabilityRepositoryImpl.findServiceAvailabilityByProviderId(booking.serviceProviderId, new Date());
            if (!serviceAvailability) throw new Error("No service found");

            if (role === roleArray[2]) {
                if (joined && joinedTime) {
                    if (!booking.onlineTrack.provider.joined && booking.onlineTrack.provider.joinedTime) {
                        booking.onlineTrack.provider.joined = true;
                        booking.onlineTrack.provider.joinedTime = joinedTime;
                    }
                } else if (joined && leftCallTime) {
                    booking.onlineTrack.provider.leftCallTime = leftCallTime;
                    if (booking.onlineTrack.user.joined) {
                        if (booking.onlineTrack.user.joinedTime && booking.onlineTrack.user.leftCallTime) {
                            booking.appointmentStatus = AppointmentStatus.Completed;
                            booking.statusTrack.push({
                                appointmentStatus: AppointmentStatus.Completed,
                                time: new Date(),
                            });
                        }
                    }
                }
            } else if (role === roleArray[1]) {
                if (joined && joinedTime) {
                    if (!booking.onlineTrack.user.joined && !booking.onlineTrack.user.joinedTime) {
                        booking.onlineTrack.user.joined = true;
                        booking.onlineTrack.user.joinedTime = joinedTime;
                    }
                } else if (joined && leftCallTime) {
                    booking.onlineTrack.user.leftCallTime = leftCallTime;
                    if (booking.onlineTrack.provider.joined) {
                        if (booking.onlineTrack.provider.joinedTime && booking.onlineTrack.provider.leftCallTime) {
                            booking.appointmentStatus = AppointmentStatus.Completed;
                            booking.statusTrack.push({
                                appointmentStatus: AppointmentStatus.Completed,
                                time: new Date(),
                            });
                        }
                    }
                }
            }

            const updatedBooking = await this.bookingRepositoryImpl.updateBooking(booking);
            if (!updatedBooking) throw new Error("Something went wrong");

            return { success: true, message: "booking onlineTracks updated", data: { duration: serviceAvailability.duration } };
        } catch (error) {
            console.log("UpdateBookingOnlineTrakingUseCase error : ", error);
            throw new Error("Failed to update booking online tracking");
        }
    }
}