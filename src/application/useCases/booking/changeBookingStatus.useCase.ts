import { kafkaConfig } from "../../../config/env";
import { Role } from "../../../domain/enums/common.enum";
import { ServiceMode } from "../../../domain/enums/service.enum";
import { formatDate } from "../../../shared/utils/helpers/formatDate";
import { toAppError } from '../../../shared/error/handleUnknownError';
import { generateId } from '../../../shared/utils/helpers/generateId';
import { ERROR_CODES, IdType } from '../../../shared/utils/types/enums';
import { formatString } from "../../../shared/utils/helpers/formatString";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";
import { createGoogleMapsUrl } from "../../../shared/utils/helpers/createGooglemapLink";
import { dateFormats, notificationType } from "../../../shared/utils/constants/constant";
import { AppError, BadRequestError, NotFoundError } from '../../../shared/error/appError';
import { IKafkaProducerAdapter } from "../../interfaces/messaging/IKafkaProducer.adapter";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { IAddressRepository } from "../../../domain/interfaces/repositories/IAddress.repository";
import { ProviderChangeBookingAppointmentStatusInput, ProviderChangeBookingAppointmentStatusOutput } from '../../dtos/booking.dto';
import { EventEnvelope, CreateGoogleCalendarEvent, SendAppointmentStatusChangeForProviderEvent, SendAppointmentStatusChangeForUserEvent, ProviderAddressForUser } from "../../dtos/kafka.dto";

export class ChangeBookingStatusUseCase {
    constructor(
        private readonly bookingRepository: IBookingRepository,
        private readonly userRepository: IUserRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter,
        private readonly addressRepository: IAddressRepository,
    ) { };

    async execute(input: ProviderChangeBookingAppointmentStatusInput): Promise<ProviderChangeBookingAppointmentStatusOutput> {
        try {
            const { bookingId, appointmentStatus, providerId } = input;
            if (!bookingId || !appointmentStatus || !providerId) {
                throw new BadRequestError();
            }

            const booking = await this.bookingRepository.findById(bookingId);
            if (!booking) {
                throw new NotFoundError(
                    "Booking not found",
                    ERROR_CODES.BOOKING_NOT_FOUND
                );
            }

            const user = await this.userRepository.findById(booking.userId);
            if (!user) {
                throw new NotFoundError(
                    "User not found",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }

            const provider = await this.userRepository.findById(providerId);
            if (!provider) {
                throw new NotFoundError(
                    "Provider not found",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }

            const now = new Date();
            if (
                appointmentStatus === AppointmentStatus.COMPLETED &&
                now < booking.sessionStartTime
            ) {
                throw new BadRequestError(
                    "A future appointment cannot be marked completed",
                    ERROR_CODES.INVALID_REQUEST
                );
            }

            if (
                appointmentStatus === AppointmentStatus.NOT_ATTENDED &&
                now < booking.sessionEndTime
            ) {
                throw new BadRequestError(
                    "An appointment cannot be marked not attended before it ends",
                    ERROR_CODES.INVALID_REQUEST
                );
            }

            booking.updateAppointmentStatus({ appointmentStatus });

            const updatedBooking = await this.bookingRepository.update(booking);
            if (!updatedBooking) {
                throw new AppError(
                    "Failed to update booking.",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }

            const providerAddress = await this.addressRepository.findByUserId(providerId);
            const formattedAddress: ProviderAddressForUser = providerAddress
                ? {
                    addressLine: providerAddress.addressLine,
                    landmark: providerAddress.landmark,
                    city: providerAddress.city,
                    state: providerAddress.state,
                    pincode: providerAddress.pincode,
                    location: providerAddress.location,
                    googleMapsUrl: createGoogleMapsUrl(providerAddress.location),
                }
                : null;

            const sessionStartTime: Date = booking.sessionStartTime ?? booking.appointmentDate;
            const userTimeZone: string = user.timeZone?.value;
            const providerTimeZone: string = provider.timeZone?.value;

            await this.kafkaProducer.publish<EventEnvelope<SendAppointmentStatusChangeForUserEvent>>(kafkaConfig.topics.pub.providerAppointmentStatusForUser, {
                eventId: generateId({ type: IdType.EVENT }),
                attempt: 1,
                maxAttempts: 2,
                occurredAt: new Date(),
                payload: {
                    emailData: {
                        email: user.email,
                        name: user.username ?? undefined,
                        appointmentDate: formatDate({
                            date: sessionStartTime,
                            pattern: dateFormats.SHORT,
                            timeZone: userTimeZone
                        }),
                        appointmentTime: formatDate({
                            date: sessionStartTime,
                            pattern: dateFormats.TIME_12H_LOWER,
                            timeZone: userTimeZone
                        }),
                        appointmentMode: formatString(booking.appointmentMode),
                        appointmentStatus: booking.appointmentStatus,
                        address: booking.appointmentMode === ServiceMode.OFFLINE ? formattedAddress : null,
                    },
                    notificationData: {
                        userId: user._id,
                        appointmentStatus: booking.appointmentStatus,
                        notificationType: notificationType.ACCOUNT_ACTIVITY,
                        address: booking.appointmentMode === ServiceMode.OFFLINE ? formattedAddress : null,
                    }
                }
            });

            await this.kafkaProducer.publish<EventEnvelope<SendAppointmentStatusChangeForProviderEvent>>(kafkaConfig.topics.pub.providerAppointmentStatusForProvider, {
                eventId: generateId({ type: IdType.EVENT }),
                attempt: 1,
                maxAttempts: 2,
                occurredAt: new Date(),
                payload: {
                    notificationData: {
                        userId: provider._id,
                        appointmentDate: formatDate({
                            date: sessionStartTime,
                            pattern: dateFormats.SHORT,
                            timeZone: providerTimeZone
                        }),
                        appointmentTime: formatDate({
                            date: sessionStartTime,
                            pattern: dateFormats.TIME_12H_LOWER,
                            timeZone: providerTimeZone
                        }),
                        appointmentMode: booking.appointmentMode,
                        appointmentStatus: booking.appointmentStatus,
                        notificationType: notificationType.ACCOUNT_ACTIVITY
                    }
                }
            });

            if (updatedBooking.appointmentStatus === AppointmentStatus.CONFIRMED) {
                await this.kafkaProducer.publish<EventEnvelope<CreateGoogleCalendarEvent>>(kafkaConfig.topics.pub.createGoogleCalendarEvent, {
                    eventId: generateId({ type: IdType.EVENT }),
                    occurredAt: new Date(),
                    attempt: 1,
                    maxAttempts: 2,
                    payload: {
                        calendarData: {
                            userId: updatedBooking.userId,
                            bookingId: updatedBooking._id,
                            role: Role.USER,
                            appointmentDate: updatedBooking.appointmentDate,
                            appointmentStatus: updatedBooking.appointmentStatus,
                            slotDuration: booking.sessionDuration,
                        }
                    }
                });
            };

            if (updatedBooking.appointmentStatus === AppointmentStatus.CONFIRMED) {
                await this.kafkaProducer.publish<EventEnvelope<CreateGoogleCalendarEvent>>(kafkaConfig.topics.pub.createGoogleCalendarEvent, {
                    eventId: generateId({ type: IdType.EVENT }),
                    occurredAt: new Date(),
                    attempt: 1,
                    maxAttempts: 2,
                    payload: {
                        calendarData: {
                            userId: updatedBooking.userId,
                            bookingId: updatedBooking._id,
                            role: Role.PROVIDER,
                            appointmentDate: updatedBooking.appointmentDate,
                            appointmentStatus: updatedBooking.appointmentStatus,
                            slotDuration: booking.sessionDuration,
                        }
                    }
                });
            };

            return {
                _id: updatedBooking?._id,
                appointmentStatus: updatedBooking?.appointmentStatus
            }

        } catch (error: unknown) {
            throw toAppError(error, "Failed to change booking status");
        };
    };
};