import { Types } from "mongoose";
import { google } from "googleapis";
import { GoogleTokenService } from "./googleTokenService";
import { durationMap, EventData } from "../../utils/constant";
import { AppointmentStatus } from "../../domain/entities/booking.entity";
import { ApiResponse, CreateGoogleCalendarEventRequest, GoogleCalendarEvent, UpdateGoogleCalendarEventRequest, UserBookingAddingToCalendar, UserBookingFetchingFromCalendar } from "../dtos/common.dto";

export class FethGoogleCalendarService {
    constructor(
        private googleTokenService: GoogleTokenService
    ) { }

    async execute(userId: Types.ObjectId): Promise<ApiResponse<Array<UserBookingFetchingFromCalendar>>> {
        try {
            console.log("FethGoogleCalendarService service start");
            const accessToken = await this.googleTokenService.getValidAccessToken(userId);

            const response = await fetch(
                "https://www.googleapis.com/calendar/v3/calendars/primary/events",
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            if (!response.ok) {
                throw new Error(`Google API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log("FethGoogleCalendarService service end");
            let result;

            if (data.items.length > 0) {
                result = data.items.map((event: UserBookingFetchingFromCalendar) => {
                    return {
                        id: event.id,
                        start: event.start.dateTime,
                        end: event.end.dateTime,
                        summary: event.summary,
                        description: event.description,
                        creator: event.creator,
                        organizer: event.organizer,
                        iCalUID: event.iCalUID,
                        reminders: event.reminders,
                        eventType: event.eventType,
                        ...event.extendedProperties?.private,
                    }
                })
            }
            return { success: true, message: "Fetched calendar events", data: result || [] }
        } catch (error) {
            console.log("FethGoogleCalendarService use case error : ", error);
            throw new Error("Calendar events fetching failed");
        }
    }
}

export class AddEventToGoogleCalendarService {
    constructor(
        private googleTokenService: GoogleTokenService
    ) { }

    async execute(payload: CreateGoogleCalendarEventRequest): Promise<ApiResponse<Pick<GoogleCalendarEvent, "id">>> {
        try {
            const { userId, slotDuration, appointmentDate, appointmentStatus} = payload;
            console.log("Event adding");
            const accessToken = await this.googleTokenService.getValidAccessToken(userId);
            if (!accessToken) throw new Error("Event saving failed.");

            const oauth2Client = new google.auth.OAuth2();
            oauth2Client.setCredentials({ access_token: accessToken });

            const calendar = google.calendar({ version: "v3", auth: oauth2Client });

            const startDate = new Date(appointmentDate);
            const durationMinutes = durationMap[slotDuration] ?? 30;
            const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

            const event: UserBookingAddingToCalendar = {
                summary: `Service Appointment`,
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
                    }
                }
            }

            const response = await calendar.events.insert({
                calendarId: "primary",
                requestBody: event
            });

            if (response?.data?.id) {
                return { success: true, message: "Booking event inserted", data: { id: response.data.id }  };
            } else {
                return { success: false, message: "Booking event inserting failed" };
            }

        } catch (error) {
            console.log("AddEventToGoogleCalendarUseCase error : ", error);
            throw new Error("Booking event saving failed");
        }
    }
}


export class UpdateEventFromGoogleCalendarService {
    constructor(
        private googleTokenService: GoogleTokenService
    ) {}

    async execute(payload: UpdateGoogleCalendarEventRequest): Promise<ApiResponse> {
        try {
            const { userId, eventId, appointmentDate, appointmentStatus } = payload;
            console.log("Deleting Google Calendar event");

            const accessToken = await this.googleTokenService.getValidAccessToken(userId);
            if (!accessToken) throw new Error("Failed to get valid access token");

            const oauth2Client = new google.auth.OAuth2();
            oauth2Client.setCredentials({ access_token: accessToken });

            const calendar = google.calendar({ version: "v3", auth: oauth2Client });
            if(!calendar) throw new Error("Event deleting failed");

            const eventResponse = await calendar.events.get({
                calendarId: "primary",
                eventId,
            });

            const event = eventResponse.data;
            if (!event) throw new Error("Event not found");

            const startDate = new Date(appointmentDate);
            const backgroundColor = appointmentStatus === AppointmentStatus.Rejected || AppointmentStatus.Cancelled ? EventData.eventCancelBorderColor : EventData.eventAddBorderColor;
            event.description = `Appointment scheduled on ${startDate.toLocaleString("en-IN", {
                    dateStyle: "full",
                    timeStyle: "short",
                })} has been cancelled`,
            event.extendedProperties = {
                    private: {
                        bookingStatus: appointmentStatus,
                        title: EventData.eventTitle + " "+ appointmentStatus,
                        backgroundColor: backgroundColor,
                        textColor: EventData.eventCancelTextColor,
                    }
                }

            const updatedResponse = await calendar.events.update({
                calendarId: "primary",
                eventId,
                requestBody: event,
            });

             if (updatedResponse?.data?.id) {
                return { success: true, message: "Booking event updated", data: { id: updatedResponse.data.id }  };
            } else {
                return { success: false, message: "Booking event updation failed" };
            }

        } catch (error) {
            console.error("DeleteEventFromGoogleCalendarService error:", error);
            return { success: false, message: "Booking event deletion failed" };
        }
    }
}