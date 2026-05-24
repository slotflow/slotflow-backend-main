import passport from "passport";
import { getGoogleCalendarUseCase } from ".";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { connectGoogleSchema } from "../../shared/zod/auth.zod";
import { GetGoogleCalendarUseCase } from "../../application/useCases/common/getGoogleCalendar.useCase";

class GoogleController {
    constructor(
        private getGoogleCalendarUseCase: GetGoogleCalendarUseCase
    ) {
        this.getUserEvents = this.getUserEvents.bind(this);
        this.connectGoogle = this.connectGoogle.bind(this);
    };

    async getUserEvents(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const result = await this.getGoogleCalendarUseCase.execute({userId: user.id });
            sendResponse(res, result);
        } catch (error) {
            next(error);
        };
    };

    async connectGoogle(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const { connectOnly, role } = connectGoogleSchema.parse({
                connectOnly: true,
                role: user.role,
            });
            const state = JSON.stringify({ connectOnly, role, userId: user.id });
            passport.authenticate("google", {
                scope: [
                    "openid",
                    "profile",
                    "email",
                    // "https://www.googleapis.com/auth/calendar.events.owned",
                    // "https://www.googleapis.com/auth/calendar.events.owned.readonly",
                    "https://www.googleapis.com/auth/calendar",
                    "https://www.googleapis.com/auth/calendar.events",
                ],
                accessType: "offline",
                prompt: "consent",
                includeGrantedScopes: true,
                session: false,
                state: state,
            })(req, res, next);
        } catch (error) {
            next(error)
        };
    };
};

export const googleController = new GoogleController(
    getGoogleCalendarUseCase
);