import { kafkaConfig } from "../../../config/env";
import { formatDate } from "../../../shared/utils/helpers/formatDate";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { generateId } from "../../../shared/utils/helpers/generateId";
import { ERROR_CODES, IdType } from "../../../shared/utils/types/enums";
import { AppError, NotFoundError } from "../../../shared/error/appError";
import { UpdateBookingAfterPaymentSuccessEventInput } from "../../dtos/kafka.dto";
import { dateFormats, notificationType } from "../../../shared/utils/constants/constant";
import { IKafkaProducerAdapter } from "../../interfaces/messaging/IKafkaProducer.adapter";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { SlotBookedEvent, EventEnvelope, GotAnAppointmentEvent } from "../../dtos/kafka.dto";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";

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

            booking.updateBookingAfterPaymentSuccess({
                paymentId,
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
                await this.kafkaProducer.publish<EventEnvelope<SlotBookedEvent>>(
                    kafkaConfig.topics.pub.slotBooked,
                    {
                        eventId: generateId({ type: IdType.EVENT }),
                        attempt: 1,
                        maxAttempts: 3,
                        occurredAt: new Date(),
                        payload: {
                            emailData: {
                                email: user.email,
                                name: user.username,
                                appointmentDate: formatDate({
                                    date: booking.appointmentDate,
                                    pattern: dateFormats.WITH_TIME,
                                    timeZone: user.timeZone?.value
                                }),
                                appointmentMode: booking.appointmentMode,
                                appointmentStatus: booking.appointmentStatus,
                                providerName: provider.username
                            },
                            notificationData: {
                                userId: user._id,
                                appointmentDate: formatDate({
                                    date: booking.appointmentDate,
                                    pattern: dateFormats.FULL,
                                    timeZone: user.timeZone?.value
                                }),
                                appointmentTime: formatDate({
                                    date: booking.appointmentDate,
                                    pattern: dateFormats.TIME_12H,
                                    timeZone: user.timeZone?.value
                                }),
                                providerName: provider.username,
                                notificationType: notificationType.ACCOUNT_ACTIVITY,
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
                        occurredAt: new Date(),
                        payload: {
                            emailData: {
                                email: provider.email,
                                name: provider.username,
                                appointmentDate: formatDate({
                                    date: booking.appointmentDate,
                                    pattern: dateFormats.WITH_TIME,
                                    timeZone: provider.timeZone?.value
                                }),
                                appointmentMode: booking.appointmentMode,
                                appointmentStatus: booking.appointmentStatus,
                                customerName: user.username,
                            },
                            notificationData: {
                                userId: provider._id,
                                appointmentDate: formatDate({
                                    date: booking.appointmentDate,
                                    pattern: dateFormats.FULL,
                                    timeZone: provider.timeZone?.value
                                }),
                                appointmentTime: formatDate({
                                    date: booking.appointmentDate,
                                    pattern: dateFormats.TIME_12H,
                                    timeZone: provider.timeZone?.value
                                }),
                                customerName: user.username,
                                notificationType: notificationType.ACCOUNT_ACTIVITY,
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