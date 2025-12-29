import { CreateGoogleCalendarEventRequest, UpdateGoogleCalendarEventRequest, UserBookingFetchingFromCalendar } from "../../../application/dtos/common.dto";

export interface IGoogleCalendarGatewayService {

    createEvent(payload: CreateGoogleCalendarEventRequest): Promise<{ id: string }>;

    updateEvent(payload: UpdateGoogleCalendarEventRequest): Promise<{ id: string }>;

    fetchEvents(accessToken: string): Promise<Array<UserBookingFetchingFromCalendar>>;

};
