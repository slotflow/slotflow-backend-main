import passport from "passport";
import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { HandleError } from "../../infrastructure/error/error";
import { GoogleCalendarService } from "../../infrastructure/services/googleCalendar";
import { GoogleTokenService } from "../../infrastructure/services/googleTokenService";                  

const googleTokenService = new GoogleTokenService();
const googleCalendarService = new GoogleCalendarService(googleTokenService);

export class GoogleController {
    constructor(
        private googleCalendarService: GoogleCalendarService
    ) {
        this.getUserEvents = this.getUserEvents.bind(this);
        this.connectGoogle = this.connectGoogle.bind(this);
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

    async connectGoogle(req: Request, res: Response, next: NextFunction) {
        console.log("connecting google");
        try {
            const user = (req.user as DecodedUser);
            if (!user) throw new Error("no user found");
            const state = JSON.stringify({ connectOnly: true, role: user.role, userId: user.userOrProviderId });
            passport.authenticate("google", {
                scope: [
                    "openid",
                    "profile",
                    "email",
                    "https://www.googleapis.com/auth/calendar.events.owned",
                    "https://www.googleapis.com/auth/calendar.events.owned.readonly",
                ],
                accessType: "offline",
                prompt: "consent",
                session: false,
                state: state,
            })(req, res, next);
        } catch (error) {
            console.log("Connecting google error : ",error);
            HandleError.handle(error, res);
        }
    }

}

const googleController = new GoogleController(
    googleCalendarService
);
export { googleController }