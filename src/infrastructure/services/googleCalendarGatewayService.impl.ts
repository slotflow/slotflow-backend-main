import { google } from "googleapis";
import { EventData } from "../../shared/utils/constants";
import { IGoogleCalendarGatewayService } from "../../domain/interfaces/services/IGoogleCalendarGateway.service";
import { CreateGoogleCalendarEventRequest, UpdateGoogleCalendarEventRequest, AddEventToCalendarProps, GetEventsFromCalendarProps } from "../../application/dtos/common.dto";

export class GoogleCalendarGatewayServiceImpl implements IGoogleCalendarGatewayService {

    async createEvent(payload: CreateGoogleCalendarEventRequest): Promise<string> {

        const { appointmentDate, appointmentStatus, slotDuration, accessToken } = payload;

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
            throw new Error("Failed to create Google Calendar event");
        }

        return response.data.id;
    };

    async updateEvent(payload: UpdateGoogleCalendarEventRequest): Promise<string> {

        const { accessToken, appointmentDate, appointmentStatus, eventId } = payload;

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
            throw new Error("Failed to update Google Calendar event");
        }

        return response.data.id;
    };

    async findEvents(accessToken: string): Promise<Array<GetEventsFromCalendarProps>> {

        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: "v3", auth });

        const response = await calendar.events.list({
            calendarId: "primary",
        });

        return (response.data.items ?? []) as Array<GetEventsFromCalendarProps>;
    };

};
