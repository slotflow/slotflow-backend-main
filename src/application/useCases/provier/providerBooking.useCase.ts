import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { formatUtcDateTime } from "../../../shared/utils/dateTime";
import { SendAppointmentStatusChangeEvent } from "../../dtos/kafka.dtos";
import { ProviderChangeBookingAppoinmentStatusRequest } from "../../dtos/provider.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IGoogleTokenService } from "../../../domain/interfaces/services/IGoogleToken.service";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/message/IKafkaProducerAdapter";

export class ProviderChangeBookingAppointmentStatusUseCase {
    constructor(
        private bookingRepository: IBookingRepository,
        private userRepository: IUserRepository,
        private googleTokenService: IGoogleTokenService,
        private kafkaProducer: IKafkaProducerAdapter
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
            
            const { date, time } = formatUtcDateTime(booking.appointmentDate);

            await this.kafkaProducer.publish<SendAppointmentStatusChangeEvent>(kafkaConfig.topics.pub.providerAppointmentStatus, {
                appointmentDate: date,
                appointmentMode: booking.appointmentMode,
                appointmentStatus: booking.appointmentStatus,
                appointmentTime: time,
                email: user.email,
                name: user.username,
                userId: user._id,
                providerId: booking.providerId,
                providerAccessToken: "",
                userAccessToken: "",
            });

        } catch (error) {
            log.error("ProviderChangeBookingAppointmentStatus failed", error as Error);
            throw error;
        };
    };
};