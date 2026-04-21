import passport from "passport";
import { getGoogleCalendarUseCase } from ".";
import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { connectGoogleSchema } from "../../shared/zod/auth.zod";
import { validateUserIdSchema } from "../../shared/zod/base.zod";
import { GetGoogleCalendarUseCase } from "../../application/useCases/common/getGoogleCalendar.useCase";
import { BadRequestError } from "../../shared/error/appError";
import { ERROR_CODES } from "../../shared/utils/types";

class GoogleController {
    constructor(
        private getGoogleCalendarUseCase: GetGoogleCalendarUseCase
    ) {
        this.getUserEvents = this.getUserEvents.bind(this);
        this.connectGoogle = this.connectGoogle.bind(this);
    };

    async getUserEvents(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("getUserEvents constroller start");
            const user = req.user as DecodedUser;
            const result = await this.getGoogleCalendarUseCase.execute({userId: user.userOrProviderId });
            sendResponse(res, result);
        } catch (error) {
            log.error("getUserEvents failed", error as Error);
            next(error);
        };
    };

    async connectGoogle(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("connectGoogle controller starting")
            const user = (req.user as DecodedUser);
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
            log.error("connectGoogle failed", error as Error);
            next(error)
        };
    };

};

export const googleController = new GoogleController(
    getGoogleCalendarUseCase
);