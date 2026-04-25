import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { IdType } from "../../../shared/utils/types";
import { generateId } from "../../../shared/utils/generateId";
import { notificationContentMap } from "../../../shared/utils/constants";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";
import { UpdateBookingAfterPaymentSuccessEventResult } from "../../dtos/common.dto";
import { BookingSavedEvent, EventEnvelope, GotAnAppointment } from "../../dtos/kafka.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";

export class UpdateBookingAfterPaymentSuccessUseCase {
    constructor(
        private readonly bookingRepository: IBookingRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter,
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(input: EventEnvelope<UpdateBookingAfterPaymentSuccessEventResult>): Promise<void> {
        try {
            const {
                payload: {
                    mbsData: {
                        bookingId,
                        paymentId
                    }
                }
            } = input;

            const booking = await this.bookingRepository.findById(bookingId);
            if (!booking) throw new Error("Booking not found.");

            booking.updateBookingAfterPayment({
                paymentId,
                appointmentStatus: AppointmentStatus.BOOKED,
            });

            await this.bookingRepository.update(booking);

            const user = await this.userRepository.findById(booking.userId);
            const provider = await this.userRepository.findById(booking.providerId);

            if (user) {

                await this.kafkaProducer.publish<EventEnvelope<BookingSavedEvent>>(
                    kafkaConfig.topics.pub.slotBooked,
                    {
                        eventId: generateId(IdType.EVENT),
                        attempt: 1,
                        maxAttempts: 3,
                        occurredAt: new Date().toISOString(),
                        payload: {
                            emailData: {
                                email: user.email,
                                name: user.username,
                                appointmentDate: booking.appointmentDate,
                                appointmentMode: booking.appointmentMode,
                                appointmentStatus: booking.appointmentStatus,
                            },
                            notificationData: {
                                userId: user._id,
                                pushNotification: user.allowPushNotification ?? false,
                                title: notificationContentMap.slotBooked.title,
                                body: notificationContentMap.slotBooked.body(booking.appointmentDate.toDateString()),
                            }
                        }
                    }
                );
            }

            if (provider) {
                await this.kafkaProducer.publish<EventEnvelope<GotAnAppointment>>(
                    kafkaConfig.topics.pub.gotAnAppointment,
                    {
                        eventId: generateId(IdType.EVENT),
                        attempt: 1,
                        maxAttempts: 3,
                        occurredAt: new Date().toISOString(),
                        payload: {
                            emailData: {
                                email: provider.email,
                                name: provider.username,
                                appointmentDate: booking.appointmentDate,
                                appointmentMode: booking.appointmentMode,
                                appointmentStatus: booking.appointmentStatus,
                            },
                            notificationData: {
                                userId: provider._id,
                                pushNotification: provider.allowPushNotification ?? false,
                                title: notificationContentMap.gotAnAppointment.title,
                                body: notificationContentMap.gotAnAppointment.body(booking.appointmentDate.toDateString()),
                            }
                        }
                    }
                );
            }

        } catch (error) {
            log.error("UpdateBookingAfterPaymentSuccessUseCase failed : ", error as Error);
        }
    }
}