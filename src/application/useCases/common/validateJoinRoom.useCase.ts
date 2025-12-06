import { isSameDay, startOfDay } from "date-fns";
import { appointmentStatusArray, roleArray } from "../../../shared/utils/constants";
import { ApiResponse, ValidateJoinRoomRequest } from "../../../infrastructure/dtos/common.dto";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";

export class ValidateJoinRoomUsecase {
    constructor(
        private bookingRepository: IBookingRepository,
    ) { }

    async execute(payload: ValidateJoinRoomRequest): Promise<ApiResponse> {
        try {
            const { bookingId, roomId, userOrProviderId, role } = payload;

            const booking = await this.bookingRepository.findBookingById(bookingId);
            if (!booking) if (!booking) throw new Error("No booking found");
            const today = startOfDay(new Date());

            if (!isSameDay(booking.appointmentDate, today)) {
                throw new Error("Booking is not scheduled for today");
            }

            if (booking.appointmentStatus !== appointmentStatusArray[5]) {
                throw new Error("Booking is not confirmed");
            }

            if (role === roleArray[1]) {
                console.log("Checking user authorization...");
                if (String(booking.userId) !== String(userOrProviderId)) {
                    throw new Error("You are not authorized for this booking");
                }
            }
            else if (role === roleArray[2]) {
                if (String(booking.serviceProviderId) !== String(userOrProviderId)) {
                    throw new Error("You are not authorized for this booking provider");
                }
            }
            else {
                throw new Error("Invalid role provided");
            }

            if (booking.videoCallRoomId !== roomId) {
                throw new Error("Invalid room ID");
            }
            return { success: true, message: "Room validate" };
        } catch (error) {
            console.log("ValidateJoinRoomUsecase error : ", error);
            throw new Error("Failed to calidate join room");
        }
    }
}