import passport from "passport";
import { DecodedUser } from "../../express";
import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { AesEncryption } from "../../infrastructure/services/aesEncryption.service";
import { IAesEncryption } from "../../domain/interfaces/services/IAesEncryption.service";
import { IGoogleCalendarGateway } from "../../domain/interfaces/services/IGoogleCalendarGateway";
import { ICredentialRepository } from "../../domain/interfaces/repositories/ICredentialRepository";
import { GoogleCalendarGateway } from "../../infrastructure/services/googleCalendarGateway.service";
import { FethGoogleCalendarUseCase } from "../../application/useCases/common/fetchGoogleCalendar.useCase";
import { CredentialRepositoryImpl } from "../../infrastructure/database/credential/credential.repository.impl";

const aesEncryption: IAesEncryption = new AesEncryption();
const googleCalendarGateway: IGoogleCalendarGateway = new GoogleCalendarGateway();
const credentialRepository: ICredentialRepository = new CredentialRepositoryImpl();

const fethGoogleCalendarUseCase = new FethGoogleCalendarUseCase(credentialRepository, aesEncryption, googleCalendarGateway);

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
            const userId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.fethGoogleCalendarUseCase.execute(userId);
            console.log("getUserEvents constroller result : ", result);
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
            const state = JSON.stringify({ connectOnly: true, role: user.role, userId: user.userOrProviderId });
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
            console.log("connectGoogle error : ", error);
            next(error)
        };
    };

};

export const googleController = new GoogleController(
    fethGoogleCalendarUseCase
);