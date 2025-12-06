import passport from "passport";
import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { AesEncryption } from "../../infrastructure/services/aesEncryption.service";
import { GoogleTokenService } from "../../infrastructure/services/googleTokenService";
import { FethGoogleCalendarService } from "../../infrastructure/services/googleCalendar";
import { IAesEncryption } from "../../domain/interfaces/services/IAesEncryption.service";
import { GoogleAuthTokenService } from "../../infrastructure/services/googleAuthToken.service";
import { ICredentialRepository } from "../../domain/interfaces/repositories/ICredentialRepository";
import { IGoogleAuthTokenService } from "../../domain/interfaces/services/IGoogleAuthToken.service";
import { CredentialRepositoryImpl } from "../../infrastructure/database/credential/credential.repository.impl";
import { GetCredentialUseCase, UpdateCredentialUseCase } from "../../application/useCases/common/credential.useCase";

const aesEncryption: IAesEncryption = new AesEncryption();
const credentialRepository: ICredentialRepository = new CredentialRepositoryImpl();

const googleAuthTokenService: IGoogleAuthTokenService = new GoogleAuthTokenService();

const getCredentialUseCase = new GetCredentialUseCase(credentialRepository, aesEncryption, googleAuthTokenService);
const updateCredentialUseCase = new UpdateCredentialUseCase(credentialRepository, aesEncryption);

// TODO need to update with new google auth token service
const googleTokenService = new GoogleTokenService(getCredentialUseCase, updateCredentialUseCase);
const fethGoogleCalendarService = new FethGoogleCalendarService(googleTokenService);

export class GoogleController {
    constructor(
        private fethGoogleCalendarService: FethGoogleCalendarService
    ) {
        this.getUserEvents = this.getUserEvents.bind(this);
        this.connectGoogle = this.connectGoogle.bind(this);
    }

    async getUserEvents(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("getUserEvents constroller start");
            const userId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.fethGoogleCalendarService.execute(new Types.ObjectId(userId));
            console.log("getUserEvents constroller result : ", result);
            res.status(200).json(result);
        } catch (error) {
            console.log("getUserEvents error : ",error);
            next(error)
        }
    }

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
        }
    }

}

const googleController = new GoogleController(
    fethGoogleCalendarService
);
export { googleController }