import { google } from "googleapis";
import { ERROR_CODES } from "../../shared/utils/types";
import { EventData } from "../../shared/utils/constants";
import { AppError, UnauthorizedError } from "../../shared/error/appError";
import { IGoogleCalendarGatewayService } from "../../domain/interfaces/services/IGoogleCalendarGateway.service";
import { CreateGoogleCalendarEventInput, UpdateGoogleCalendarEventInput, AddEventToCalendarProps, GetEventsFromCalendarProps } from "../../application/dtos/common.dto";

export class GoogleCalendarGatewayServiceImpl implements IGoogleCalendarGatewayService {

    async createEvent(query: CreateGoogleCalendarEventInput): Promise<string> {
        try {

            const { appointmentDate, appointmentStatus, slotDuration, accessToken } = query;

            const startDate = new Date(appointmentDate);
            const endDate = new Date(startDate.getTime() + slotDuration * 60 * 1000);

            const event: AddEventToCalendarProps = {
                summary: "Service Appointment",
                description: `You have an appointment scheduled on ${startDate.toLocaleString("en-IN", {
                    dateStyle: "full",
                    timeStyle: "short",
                })}`,
                start: {
                    dateTime: startDate.toISOString(),
                    timeZone: EventData.eventTimeZone,
                },
                end: {
                    dateTime: endDate.toISOString(),
                    timeZone: EventData.eventTimeZone,
                },
                extendedProperties: {
                    private: {
                        bookingStatus: appointmentStatus,
                        title: EventData.eventTitle,
                        backgroundColor: EventData.eventAddBorderColor,
                        textColor: EventData.eventAddTextColor,
                    },
                },
            };

            const auth = new google.auth.OAuth2();
            auth.setCredentials({ access_token: accessToken });

            const calendar = google.calendar({
                version: "v3",
                auth,
            });

            const response = await calendar.events.insert({
                calendarId: "primary",
                requestBody: event,
            });

            if (!response.data?.id) {
                throw new AppError(
                    "Failed to create calendar event",
                    502,
                    false,
                    ERROR_CODES.GOOGLE_API_ERROR
                );
            }

            return response.data.id;
        } catch (error: unknown) {
            throw this.handleGoogleError(error, "create event");
        }
    };

    async updateEvent(query: UpdateGoogleCalendarEventInput): Promise<string> {
        try {

            const { accessToken, appointmentDate, appointmentStatus, eventId } = query;

            const startDate = new Date(appointmentDate);

            const eventUpdate: Partial<AddEventToCalendarProps> = {
                description: `Appointment scheduled on ${startDate.toLocaleString("en-IN", {
                    dateStyle: "full",
                    timeStyle: "short",
                })} has been ${appointmentStatus}`,
                extendedProperties: {
                    private: {
                        bookingStatus: appointmentStatus,
                        title: `${EventData.eventTitle} ${appointmentStatus}`,
                        backgroundColor: EventData.eventCancelBorderColor,
                        textColor: EventData.eventCancelTextColor,
                    },
                },
            };

            const auth = new google.auth.OAuth2();
            auth.setCredentials({ access_token: accessToken });

            const calendar = google.calendar({ version: "v3", auth });

            const response = await calendar.events.update({
                calendarId: "primary",
                eventId,
                requestBody: eventUpdate,
            });

            if (!response.data?.id) {
                throw new AppError(
                    "Failed to update calendar event",
                    502,
                    false,
                    ERROR_CODES.GOOGLE_API_ERROR
                );
            }

            return response.data.id;
        } catch (error: unknown) {
            throw this.handleGoogleError(error, "update event");
        }
    };

    async findEvents(accessToken: string): Promise<Array<GetEventsFromCalendarProps>> {
        try {

            const auth = new google.auth.OAuth2();
            auth.setCredentials({ access_token: accessToken });

            const calendar = google.calendar({ version: "v3", auth });

            const response = await calendar.events.list({
                calendarId: "primary",
            });

            return (response.data.items ?? []) as Array<GetEventsFromCalendarProps>;
        } catch (error: unknown) {
            throw this.handleGoogleError(error, "fetch events");
        }
    };

    private handleGoogleError(error: any, action: string): AppError {

        const status = error?.code || error?.response?.status;

        if (status === 401) {
            return new UnauthorizedError(
                "Google access token expired or invalid",
                ERROR_CODES.TOKEN_EXPIRED
            );
        }

        if (status === 403) {
            return new AppError(
                "Google permission denied",
                403,
                true,
                ERROR_CODES.FORBIDDEN
            );
        }

        if (status === 429) {
            return new AppError(
                "Google API rate limit exceeded",
                429,
                true,
                ERROR_CODES.GOOGLE_API_ERROR
            );
        }

        return new AppError(
            `Google API failed to ${action}`,
            502,
            false,
            ERROR_CODES.GOOGLE_API_ERROR
        );
    }

};
