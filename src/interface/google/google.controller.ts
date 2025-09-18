import passport from "passport";
import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { HandleError } from "../../infrastructure/error/error";
import { AesEncryption } from "../../infrastructure/services/aesEncryption";
import { GoogleCalendarService } from "../../infrastructure/services/googleCalendar";
import { GoogleTokenService } from "../../infrastructure/services/googleTokenService";   
import { CredentialRepositoryImpl } from "../../infrastructure/database/credential/credential.repository.impl";
import { GetCredentialUseCase, UpdateCredentialUseCase } from "../../application/common-use.case/credential.use-case";

const aesEncryption = new AesEncryption()
const credentialRepositoryImpl = new CredentialRepositoryImpl()
const getCredentialUseCase = new GetCredentialUseCase(credentialRepositoryImpl, aesEncryption);
const updateCredentialUseCase = new UpdateCredentialUseCase(credentialRepositoryImpl, aesEncryption);

const googleTokenService = new GoogleTokenService(getCredentialUseCase, updateCredentialUseCase);
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
            const result = await this.googleCalendarService.execute(new Types.ObjectId(userId));
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

    async connectGoogle(req: Request, res: Response, next: NextFunction) {
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