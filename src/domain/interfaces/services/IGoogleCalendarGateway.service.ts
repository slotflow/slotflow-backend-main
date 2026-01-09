import { CreateGoogleCalendarEventRequest, UpdateGoogleCalendarEventRequest, FetchEventsFromCalendarProps } from "../../../application/dtos/common.dto";

export interface IGoogleCalendarGatewayService {

    createEvent(payload: CreateGoogleCalendarEventRequest): Promise<string>;

    updateEvent(payload: UpdateGoogleCalendarEventRequest): Promise<string>;

    fetchEvents(accessToken: string): Promise<Array<FetchEventsFromCalendarProps>>;

};
