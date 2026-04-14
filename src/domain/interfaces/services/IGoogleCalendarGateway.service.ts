import { CreateGoogleCalendarEventInput, UpdateGoogleCalendarEventInput, GetEventsFromCalendarProps } from "../../../application/dtos/common.dto";

export interface IGoogleCalendarGatewayService {

    createEvent(query: CreateGoogleCalendarEventInput): Promise<string>;

    updateEvent(query: UpdateGoogleCalendarEventInput): Promise<string>;

    findEvents(accessToken: string): Promise<Array<GetEventsFromCalendarProps>>;

};
