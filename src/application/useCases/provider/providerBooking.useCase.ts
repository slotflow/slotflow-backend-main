import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { formatUtcDateTime } from "../../../shared/utils/dateTime";
import { EventEnvelope, CreateGoogleCalendarEvent, SendAppointmentStatusChangeForProviderEvent, SendAppointmentStatusChangeForUserEvent } from "../../dtos/kafka.dtos";
import { ProviderChangeBookingAppoinmentStatusRequest } from "../../dtos/provider.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IGoogleTokenService } from "../../../domain/interfaces/services/IGoogleToken.service";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/message/IKafkaProducerAdapter";
import { notificationContentMap } from "../../../shared/utils/constants";
import { NotificationType, Role } from "../../../domain/enums/common.enum";
import { uuidv4 } from "zod/v4";

export class ProviderChangeBookingAppointmentStatusUseCase {
    constructor(
        private bookingRepository: IBookingRepository,
        private userRepository: IUserRepository,
        private googleTokenService: IGoogleTokenService,
        private kafkaProducer: IKafkaProducerAdapter
    ) { };

    async execute(payload: ProviderChangeBookingAppoinmentStatusRequest): Promise<void> {
        try {
            const { _id, appointmentStatus, providerId } = payload;

            const booking = await this.bookingRepository.findById(_id);
            if (!booking) throw new Error("No booking found");

            const user = await this.userRepository.findById(booking.userId);
            if (!user) throw new Error("No user found");

            const userAccessToken = await this.googleTokenService.getAccessToken(user._id);
            const providerAccessToken = await this.googleTokenService.getAccessToken(providerId);

            booking.updateAppointment({ appointmentStatus });

            await this.bookingRepository.update(booking);

            const { date, time } = formatUtcDateTime(booking.appointmentDate);

            await this.kafkaProducer.publish<SendAppointmentStatusChangeForUserEvent>(kafkaConfig.topics.pub.providerAppointmentStatusForUser, {
                data: {
                    appointmentDate: date,
                    appointmentMode: booking.appointmentMode,
                    appointmentStatus: booking.appointmentStatus,
                    appointmentTime: time,
                    notificationType: NotificationType.BOOKING,
                },
                email: user.email,
                name: user.username,
                userId: user._id,
                pushNotification: user.allowPushNotification ?? false,
                title: notificationContentMap.appointmentStatusChangeForUser.title,
                body: notificationContentMap.appointmentStatusChangeForUser.body(booking.appointmentStatus),
            });

            await this.kafkaProducer.publish<SendAppointmentStatusChangeForProviderEvent>(kafkaConfig.topics.pub.providerAppointmentStatusForProvider, {
                data: {
                    appointmentDate: date,
                    appointmentMode: booking.appointmentMode,
                    appointmentStatus: booking.appointmentStatus,
                    appointmentTime: time,
                    notificationType: NotificationType.APPOINTMENT,
                },
                userId: user._id,
                pushNotification: user.allowPushNotification ?? false,
                title: notificationContentMap.appointmentStatusChangeForProvider.title,
                body: notificationContentMap.appointmentStatusChangeForProvider.body(booking.appointmentStatus),
            });

            await this.kafkaProducer.publish<EventEnvelope<CreateGoogleCalendarEvent>>(kafkaConfig.topics.pub.createGoogleCalendar, {
                eventId: uuidv4(),
                occurredAt: new Date(),
                attempt: 1,
                maxAttempts: 2,
                payload: {
                    bookingId: booking._id,
                    user: userAccessToken ? {
                        userId: user._id,
                        accessToken: userAccessToken
                    } : null,
                    provider: providerAccessToken ? {
                        providerId: providerId,
                        accessToken: providerAccessToken
                    } : null,
                    appointmentDate: booking.appointmentDate,
                    appointmentStatus: booking.appointmentStatus,
                }
            });

        } catch (error) {
            log.error("ProviderChangeBookingAppointmentStatus failed", error as Error);
            throw error;
        };
    };
};