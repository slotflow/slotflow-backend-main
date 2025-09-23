import { isSameDay, startOfDay } from "date-fns";
import { AppError } from "../../infrastructure/error/appError";
import { AppointmentStatus } from "../../domain/entities/booking.entity";
import { ApiResponse, Role, ValidateJoinRoomRequest } from "../../infrastructure/dtos/common.dto";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";

export class ValidateJoinRoomUsecase {
    constructor(
        private bookingRepositoryImpl: BookingRepositoryImpl,
    ) { }

    async execute(payload: ValidateJoinRoomRequest): Promise<ApiResponse> {

        const { bookingId, roomId, userOrProviderId, role } = payload;

        const booking = await this.bookingRepositoryImpl.findBookingById(bookingId);
        if (!booking) if (!booking) throw new AppError("No booking found", 404);
        const today = startOfDay(new Date());
        //TODO
        // if (!isSameDay(booking.appointmentDate, today)) {
        //     throw new AppError("Booking is not scheduled for today");
        // }

        if (booking.appointmentStatus !== AppointmentStatus.Confirmed) {
            throw new AppError("Booking is not confirmed");
        }
        console.log("payload : ", payload);
        console.log("booking : ", booking);

        if (role === Role.user) {
            console.log("Checking user authorization...");
            if (String(booking.userId) !== String(userOrProviderId)) {
                throw new AppError("You are not authorized for this booking", 403);
            }
        }
        // --- PROVIDER CHECK ---
        else if (role === Role.provider) {
            console.log("Checking provider authorization...");
            console.log("String(booking.serviceProviderId) !== String(userOrProviderId", String(booking.serviceProviderId) === String(userOrProviderId));
            if (String(booking.serviceProviderId) !== String(userOrProviderId)) {
                throw new AppError("You are not authorized for this booking", 403);
            }
        }
        // --- INVALID ROLE ---
        else {
            throw new AppError("Invalid role provided", 400);
        }

        if (booking.videoCallRoomId !== roomId) {
            throw new AppError("Invalid room ID", 400);
        }
        return { success: true, message: "Room validate" };
    }
}