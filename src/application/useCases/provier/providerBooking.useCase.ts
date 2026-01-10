import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { formatToISTDateTime } from "../../../shared/utils/dateTime.ts";
import { ProviderChangeBookingAppoinmentStatusRequest } from "../../dtos/provider.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
// import { IKafkaClientAdapter } from "../../../domain/interfaces/message/IKafkaClientAdapter";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { IGoogleTokenService } from "../../../domain/interfaces/services/IGoogleToken.service.ts";
import { SendAppointmentStatusChangeEvent, UpdateGoogleCalendarEvent } from "../../dtos/common.dto";

export class ProviderChangeBookingAppointmentStatusUseCase {
    constructor(
        private bookingRepository: IBookingRepository,
        private userRepository: IUserRepository,
        private googleTokenService: IGoogleTokenService,
        // private kafkaClientAdapter: IKafkaClientAdapter,
    ) { };

    async execute(payload: ProviderChangeBookingAppoinmentStatusRequest): Promise<void> {
        try {
            const { _id, appointmentStatus } = payload;

            const booking = await this.bookingRepository.findById(_id);
            if (!booking) throw new Error("No booking found");

            const user = await this.userRepository.findById(booking.userId);
            if(!user) throw new Error("No user found");

            const accessToken = await this.googleTokenService.getAccessToken(user._id);
            if(!accessToken) throw new Error("Something went wrong");

            booking.updateAppointment({ appointmentStatus });

            await this.bookingRepository.update(booking);
            
            const { date, time } = formatToISTDateTime(booking.appointmentDate);

            // await this.kafkaClientAdapter.publish<UpdateGoogleCalendarEvent>(kafkaConfig.topics.pub.googleCalendarUpdateRequest, {
            //     accessToken: accessToken,
            //     appointmentDate: date,
            //     appointmentStatus: booking.appointmentStatus,
            //     bookingId: booking._id,
            //     eventId: booking.googleEventId
            // });

            // await this.kafkaClientAdapter.publish<SendAppointmentStatusChangeEvent>(kafkaConfig.topics.pub.appointmentStatus, {
            //     appointmentDate: date,
            //     appointmentMode: booking.appointmentMode,
            //     appointmentStatus: booking.appointmentStatus,
            //     appointmentTime: time,
            //     email: user.email,
            //     name: user.username
            // });

        } catch (error) {
            log.error("ProviderChangeBookingAppointmentStatus failed", error as Error);
            throw error;
        };
    };
};