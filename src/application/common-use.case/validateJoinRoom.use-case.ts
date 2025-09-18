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

        if (role === Role.user && !booking.userId.equals(userOrProviderId)) {
            throw new AppError("You are not authorized for this booking", 403);
        }

        if (role === Role.provider && !booking.serviceProviderId.equals(userOrProviderId)) {
            throw new AppError("You are not authorized for this booking", 403);
        }

        if (booking.videoCallRoomId !== roomId) {
            throw new AppError("Invalid room ID", 400);
        }
        return { success: true, message: "Room validate" };
    }
}