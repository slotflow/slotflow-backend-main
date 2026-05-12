import { kafkaConfig } from "../../../config/env";
import { generateId } from "../../../shared/utils/generateId";
import { ERROR_CODES, IdType } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { notificationContentMap } from "../../../shared/utils/constants";
import { AppError, NotFoundError } from "../../../shared/error/appError";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";
import { UpdateBookingAfterPaymentSuccessEventInput } from "../../dtos/kafka.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { BookingSavedEvent, EventEnvelope, GotAnAppointmentEvent } from "../../dtos/kafka.dto";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";

export class UpdateBookingAfterPaymentSuccessUseCase {
    constructor(
        private readonly bookingRepository: IBookingRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter,
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(input: UpdateBookingAfterPaymentSuccessEventInput): Promise<void> {
        try {
            const { bookingId, paymentId } = input;

            const booking = await this.bookingRepository.findById(bookingId);
            if (!booking) {
                throw new NotFoundError(
                    "Booking not found",
                    ERROR_CODES.BOOKING_NOT_FOUND
                )
            }

            booking.updateBookingAfterPayment({
                paymentId,
                appointmentStatus: AppointmentStatus.BOOKED,
            });

            const updatedBooking = await this.bookingRepository.update(booking);
            if (!updatedBooking) {
                throw new AppError(
                    "Failed to update booking",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                )
            }

            const user = await this.userRepository.findById(booking.userId);
            if (!user) {
                throw new NotFoundError(
                    "User not found",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }
            const provider = await this.userRepository.findById(booking.providerId);
            if (!provider) {
                throw new NotFoundError(
                    "Provider not found",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }

            if (user) {

                await this.kafkaProducer.publish<EventEnvelope<BookingSavedEvent>>(
                    kafkaConfig.topics.pub.slotBooked,
                    {
                        eventId: generateId({ type: IdType.EVENT }),
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
                await this.kafkaProducer.publish<EventEnvelope<GotAnAppointmentEvent>>(
                    kafkaConfig.topics.pub.gotAnAppointment,
                    {
                        eventId: generateId({ type: IdType.EVENT }),
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
            throw toAppError(error, "Failed to update booking after payment");
        }
    }
}