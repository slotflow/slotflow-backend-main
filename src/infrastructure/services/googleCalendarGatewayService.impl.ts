import { google } from "googleapis";
import { EventData } from "../../shared/utils/constants";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus.enum";
import { IGoogleCalendarGatewayService } from "../../domain/interfaces/services/IGoogleCalendarGateway.service";
import { CreateGoogleCalendarEventRequest, UpdateGoogleCalendarEventRequest, UserBookingAddingToCalendar, UserBookingFetchingFromCalendar } from "../../application/dtos/common.dto";

export class GoogleCalendarGatewayImpl implements IGoogleCalendarGatewayService {

    async createEvent(payload: CreateGoogleCalendarEventRequest): Promise<{ id: string }> {

        const { appointmentDate, appointmentStatus, slotDuration, accessToken } = payload;

        const startDate = new Date(appointmentDate);
        const endDate = new Date(startDate.getTime() + slotDuration * 60 * 1000);

        const event: UserBookingAddingToCalendar = {
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
            throw new Error("Failed to create Google Calendar event");
        }

        return { id: response.data.id };
    };

    async updateEvent(payload: UpdateGoogleCalendarEventRequest): Promise<{ id: string }> {

        const { accessToken, appointmentDate, appointmentStatus, event, eventId, userId } = payload;

        const startDate = new Date(appointmentDate);

        const isCancelled =
            appointmentStatus === AppointmentStatus.RejectedByProvider ||
            appointmentStatus === AppointmentStatus.Cancelled;

        const eventUpdate: Partial<UserBookingAddingToCalendar> = {
            description: isCancelled
                ? `Appointment scheduled on ${startDate.toLocaleString("en-IN", {
                    dateStyle: "full",
                    timeStyle: "short",
                })} has been cancelled`
                : undefined,
            extendedProperties: {
                private: {
                    bookingStatus: appointmentStatus,
                    title: `${EventData.eventTitle} ${appointmentStatus}`,
                    backgroundColor: isCancelled
                        ? EventData.eventCancelBorderColor
                        : EventData.eventAddBorderColor,
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
            requestBody: event,
        });

        if (!response.data?.id) {
            throw new Error("Failed to update Google Calendar event");
        }

        return { id: response.data.id };
    };

    async fetchEvents(accessToken: string): Promise<Array<UserBookingFetchingFromCalendar>> {

        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: "v3", auth });

        const response = await calendar.events.list({
            calendarId: "primary",
        });

        return (response.data.items ?? []) as Array<UserBookingFetchingFromCalendar>;
    };

};
