import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";
import { IKafkaService } from "../../../domain/interfaces/services/IKafka.service";
import { ProviderChangeBookingAppoinmentStatusRequest } from "../../dtos/provider.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";

export class ProviderChangeBookingAppointmentStatusUseCase {
    constructor(
        private bookingRepository: IBookingRepository,
        private kafkaService: IKafkaService,
        private userRepository: IUserRepository,
    ) { };

    async execute(payload: ProviderChangeBookingAppoinmentStatusRequest): Promise<void> {
        try {
            const { _id, appointmentStatus } = payload;

            const booking = await this.bookingRepository.findById(_id);
            if (!booking) throw new Error("No booking found");

            const user = await this.userRepository.findById(booking.userId);
            if(!user) throw new Error("No user found");

            booking.updateAppointment({ appointmentStatus });

            // TODO update event
            // const response = await this.updateEventFromGoogleCalendarService.execute({
            //     userId: booking.userId,
            //     eventId: booking.googleEventId,
            //     appointmentDate: booking.appointmentDate,
            //     appointmentStatus: appointmentStatus
            // });

            // if (!response.success) throw new Error("Booking status updating failed");

            await this.bookingRepository.update(booking);

            await this.kafkaService.send({
                topic: appointmentStatus === AppointmentStatus.Confirmed ? kafkaConfig.topics.confirmAppointment : kafkaConfig.topics.rejectAppointment,
                key: user.email,
                message: {
                    name: user.username,
                    email: user.email,
                    contentNumber: 1
                },
            });

        } catch (error) {
            log.error("ProviderChangeBookingAppointmentStatus failed", error as Error);
            throw error;
        };
    };
};