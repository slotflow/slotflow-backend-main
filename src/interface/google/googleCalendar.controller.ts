import { DecodedUser } from "../../express";
import { Request, Response } from "express";
import { HandleError } from "../../infrastructure/error/error";
import { GoogleCalendarService } from "../../infrastructure/services/googleCalendar";
import { GoogleTokenService } from "../../infrastructure/services/googleTokenService";

const googleTokenService = new GoogleTokenService();
const googleCalendarService = new GoogleCalendarService(googleTokenService);

export class GoogleCalendarController {
    constructor(
        private googleCalendarService: GoogleCalendarService
    ) {
        this.getUserEvents = this.getUserEvents.bind(this);
    }

    async getUserEvents(req: Request, res: Response) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.googleCalendarService.fetchCalendarEvents(userId);
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }
}

const googleCalendarController = new GoogleCalendarController(
    googleCalendarService
);
export { googleCalendarController }
