import { kafkaConfig } from "../../../config/env";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { log } from "../../../shared/logger/logger";
import { notificationContentMap } from "../../../shared/utils/constants";
import { UpdateBookingAfterPaymentSuccessEventResult } from "../../dtos/common.dto";
import { BookingSavedEvent, EventEnvelope } from "../../dtos/kafka.dtos";
import { v4 as uuidv4 } from 'uuid';

export class UpdateBookingAfterPaymentSuccessUseCase {
    constructor(
        private readonly bookingRepository: IBookingRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter,
        private readonly userRepository: IUserRepository
    ) { }

    async execute(Payload: EventEnvelope<UpdateBookingAfterPaymentSuccessEventResult>): Promise<void> {
        try {
            const {
                payload: {
                    mbsData: {
                        bookingId,
                        paymentId
                    }
                }
            } = Payload;

            const booking = await this.bookingRepository.findById(bookingId);
            if (!booking) throw new Error("Booking not found.");

            booking.updateBookingAfterPayment({
                paymentId,
                appointmentStatus: AppointmentStatus.CONFIRMED,
            });

            await this.bookingRepository.update(booking);

            const user = await this.userRepository.findById(booking.userId);
            if (!user) throw new Error("User not found.");

            await this.kafkaProducer.publish<EventEnvelope<BookingSavedEvent>>(
                kafkaConfig.topics.pub.bookingCompleted,
                {
                    eventId: uuidv4(),
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
                            title: notificationContentMap.bookingCompleted.title,
                            body: notificationContentMap.bookingCompleted.body(booking.appointmentDate.toDateString()),
                        }
                    }
                }
            )

        } catch (error) {
            log.error("UpdateBookingAfterPaymentSuccessUseCase failed : ", error as Error);
            throw error;
        }
    }
}