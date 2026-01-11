import { isSameDay, startOfDay } from "date-fns";
import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/role.enum";
import { ValidateJoinRoomRequest } from "../../dtos/common.dto";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";

export class ValidateJoinRoomUsecase {
    constructor(
        private bookingRepository: IBookingRepository,
    ) { };

    async execute(payload: ValidateJoinRoomRequest): Promise<void> {
        try {
            const { bookingId, roomId, userOrProviderId, role } = payload;

            const booking = await this.bookingRepository.findById(bookingId);
            if (!booking) if (!booking) throw new Error("No booking found");
            const today = startOfDay(new Date());

            if (!isSameDay(booking.appointmentDate, today)) {
                throw new Error("Booking is not scheduled for today");
            };

            if (booking.appointmentStatus !== AppointmentStatus.Confirmed) {
                throw new Error("Booking is not confirmed");
            };

            if (role === Role.User) {
                console.log("Checking user authorization...");
                if (String(booking.userId) !== String(userOrProviderId)) {
                    throw new Error("You are not authorized for this booking");
                }
            } else if (role === Role.Provider) {
                if (String(booking.serviceProviderId) !== String(userOrProviderId)) {
                    throw new Error("You are not authorized for this booking provider");
                }
            } else {
                throw new Error("Invalid request");
            };

            if (booking.videoCallRoomId !== roomId) {
                throw new Error("Invalid room ID");
            };
            
        } catch (error) {
            log.error("ValidateJoinRoomUsecase failed", error as Error);
            throw error;
        };
    };
};