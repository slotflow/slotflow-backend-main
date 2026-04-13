import { CreateGoogleCalendarEventRequest, UpdateGoogleCalendarEventRequest, GetEventsFromCalendarProps } from "../../../application/dtos/common.dto";

export interface IGoogleCalendarGatewayService {

    createEvent(payload: CreateGoogleCalendarEventRequest): Promise<string>;

    updateEvent(payload: UpdateGoogleCalendarEventRequest): Promise<string>;

    findEvents(accessToken: string): Promise<Array<GetEventsFromCalendarProps>>;

};
