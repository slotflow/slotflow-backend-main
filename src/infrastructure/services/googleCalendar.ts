import { ApiResponse } from "../dtos/common.dto";
import { GoogleTokenService } from "./googleTokenService";

export class GoogleCalendarService {
    constructor(
        private googleTokenService: GoogleTokenService
    ) {}

    async fetchCalendarEvents(userId: string): Promise<ApiResponse> {
        try {
            const accessToken = await this.googleTokenService.getValidAccessToken(userId);

            const response = await fetch(
                "https://www.googleapis.com/calendar/v3/calendars/primary/events",
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            if (!response.ok) {
                throw new Error(`Google API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return { success: true, message: "Fetched calendar events", data: data.items || []}
        } catch {
            throw new Error("Calendar events fetching failed");
        }
    }
}