import passport from "passport";
import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { AesEncryption } from "../../infrastructure/services/aesEncryption";
import { GoogleTokenService } from "../../infrastructure/services/googleTokenService";
import { FethGoogleCalendarService } from "../../infrastructure/services/googleCalendar";
import { CredentialRepositoryImpl } from "../../infrastructure/database/credential/credential.repository.impl";
import { GetCredentialUseCase, UpdateCredentialUseCase } from "../../application/common-use.case/credential.use-case";

const aesEncryption = new AesEncryption()
const credentialRepositoryImpl = new CredentialRepositoryImpl()
const getCredentialUseCase = new GetCredentialUseCase(credentialRepositoryImpl, aesEncryption);
const updateCredentialUseCase = new UpdateCredentialUseCase(credentialRepositoryImpl, aesEncryption);

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