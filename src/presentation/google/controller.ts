import passport from "passport";
import { fethGoogleCalendarUseCase } from ".";
import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { connectGoogleSchema } from "../../shared/zod/auth.zod";
import { validateUserIdSchema } from "../../shared/zod/user.zod";
import { FethGoogleCalendarUseCase } from "../../application/useCases/common/fetchGoogleCalendar.useCase";

class GoogleController {
    constructor(
        private fethGoogleCalendarUseCase: FethGoogleCalendarUseCase
    ) {
        this.getUserEvents = this.getUserEvents.bind(this);
        this.connectGoogle = this.connectGoogle.bind(this);
    };

    async getUserEvents(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("getUserEvents constroller start");
            const { userId } = validateUserIdSchema.parse((req.user as DecodedUser).userOrProviderId)
            const result = await this.fethGoogleCalendarUseCase.execute(userId);
            sendResponse(res, result);
        } catch (error) {
            log.error("getUserEvents failed",error as Error);
            next(error);
        };
    };

    async connectGoogle(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("connectGoogle controller starting")
            const user = (req.user as DecodedUser);
            if (!user) throw new Error("no user found");
            const { connectOnly, role, userId } = connectGoogleSchema.parse({
                connectOnly: true,
                role: user.role,
                userId: user.userOrProviderId
            });
            const state = JSON.stringify({ connectOnly, role, userId });
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
            log.error("connectGoogle failed",error as Error);
            next(error)
        };
    };

};

export const googleController = new GoogleController(
    fethGoogleCalendarUseCase
);