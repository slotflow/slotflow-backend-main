import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { formatUtcDateTime } from "../../../shared/utils/dateTime";
import { notificationContentMap } from "../../../shared/utils/constants";
import { NotificationType, Role } from "../../../domain/enums/common.enum";
import { ProviderChangeBookingAppointmentStatusInput } from '../../dtos/booking.dtos';
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IGoogleTokenService } from "../../../domain/interfaces/services/IGoogleToken.service";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { EventEnvelope, CreateGoogleCalendarEvent, SendAppointmentStatusChangeForProviderEvent, SendAppointmentStatusChangeForUserEvent } from "../../dtos/kafka.dtos";

export class ChangeBookingStatusUseCase {
    constructor(
        private readonly bookingRepository: IBookingRepository,
        private readonly userRepository: IUserRepository,
        private readonly googleTokenService: IGoogleTokenService,
        private readonly kafkaProducer: IKafkaProducerAdapter,
    ) { };

    async execute(input: ProviderChangeBookingAppointmentStatusInput): Promise<void> {
        try {
            const { _id, appointmentStatus, providerId } = input;

            const booking = await this.bookingRepository.findById(_id);
            if (!booking) throw new Error("No booking found");

            const user = await this.userRepository.findById(booking.userId);
            if (!user) throw new Error("No user found");

            const provider = await this.userRepository.findById(providerId);
            if (!provider) throw new Error("No provider found");

            let userAccessToken: string | null = null;
            if(user.googleConnected) {   
                userAccessToken = await this.googleTokenService.getAccessToken(user._id);
            }
            
            let providerAccessToken: string | null = null;
            if(provider.googleConnected) {
                providerAccessToken = await this.googleTokenService.getAccessToken(providerId);
            }

            booking.updateAppointmentStatus({ appointmentStatus });

            await this.bookingRepository.update(booking);

            const { date, time } = formatUtcDateTime(booking.appointmentDate);

            await this.kafkaProducer.publish<EventEnvelope<SendAppointmentStatusChangeForUserEvent>>(kafkaConfig.topics.pub.providerAppointmentStatusForUser, {
                eventId: uuidv4(),
                attempt: 1,
                maxAttempts: 2,
                occurredAt: new Date().toISOString(),
                payload: {
                    emailData: {
                        email: user.email,
                        name: user.username,
                        appointmentDate: date,
                        appointmentMode: booking.appointmentMode,
                        appointmentStatus: booking.appointmentStatus,
                        appointmentTime: time,
                    },
                    notificationData: {
                        userId: user._id,
                        pushNotification: user.allowPushNotification ?? false,
                        title: notificationContentMap.appointmentStatusChangeForUser.title,
                        body: notificationContentMap.appointmentStatusChangeForUser.body(booking.appointmentStatus),
                    }
                }
            });

            await this.kafkaProducer.publish<EventEnvelope<SendAppointmentStatusChangeForProviderEvent>>(kafkaConfig.topics.pub.providerAppointmentStatusForProvider, {
                eventId: uuidv4(),
                attempt: 1,
                maxAttempts: 2,
                occurredAt: new Date().toISOString(),
                payload: {
                    notificationData: {
                        userId: provider._id,
                        pushNotification: provider.allowPushNotification ?? false,
                        title: notificationContentMap.appointmentStatusChangeForProvider.title,
                        body: notificationContentMap.appointmentStatusChangeForProvider.body(booking.appointmentStatus),
                        data: {
                            appointmentDate: date,
                            appointmentMode: booking.appointmentMode,
                            appointmentStatus: booking.appointmentStatus,
                            appointmentTime: time,
                            notificationType: NotificationType.APPOINTMENT,
                        }
                    }
                }
            });

            if (userAccessToken) {
                await this.kafkaProducer.publish<EventEnvelope<CreateGoogleCalendarEvent>>(kafkaConfig.topics.pub.createGoogleCalendarEvent, {
                    eventId: uuidv4(),
                    occurredAt: new Date().toString(),
                    attempt: 1,
                    maxAttempts: 2,
                    payload: {
                        calendarData: {
                            bookingId: booking._id,
                            role: Role.USER,
                            accessToken: userAccessToken,
                            appointmentDate: booking.appointmentDate,
                            appointmentStatus: booking.appointmentStatus,
                        }
                    }
                });
            };

            if (providerAccessToken) {
                await this.kafkaProducer.publish<EventEnvelope<CreateGoogleCalendarEvent>>(kafkaConfig.topics.pub.createGoogleCalendarEvent, {
                    eventId: uuidv4(),
                    occurredAt: new Date().toString(),
                    attempt: 1,
                    maxAttempts: 2,
                    payload: {
                        calendarData: {
                            bookingId: booking._id,
                            role: Role.PROVIDER,
                            accessToken: providerAccessToken,
                            appointmentDate: booking.appointmentDate,
                            appointmentStatus: booking.appointmentStatus,
                        }
                    }
                });
            };

        } catch (error) {
            log.error("ChangeBookingStatusUseCase failed", error as Error);
            throw error;
        };
    };
};