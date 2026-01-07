import { log } from "../../../shared/logger/logger";
import { UserBookingFetchingFromCalendar } from "../../dtos/common.dto";
import { IAesEncryptionService } from "../../../domain/interfaces/services/IAesEncryption.service";
import { ICredentialRepository } from "../../../domain/interfaces/repositories/ICredentialRepository";
import { IGoogleCalendarGatewayService } from "../../../domain/interfaces/services/IGoogleCalendarGateway.service";

export class FethGoogleCalendarUseCase {
    constructor(
        private credentialRepository: ICredentialRepository,
        private aesEncryption: IAesEncryptionService,
        private googleCalendarGatewayService: IGoogleCalendarGatewayService
    ) { };

    async execute(userId: string): Promise<Array<UserBookingFetchingFromCalendar>> {
        try {
            const credential = await this.credentialRepository.findByUserId(userId);
            if (!credential) {
                throw new Error("Credential not found");
            };

            const accessToken = await this.aesEncryption.decrypt(credential.accessToken);
            const refreshToken = await this.aesEncryption.decrypt(credential.refreshToken);

            const events = await this.googleCalendarGatewayService.fetchEvents(accessToken);
            
            return events.map((event: UserBookingFetchingFromCalendar) => ({
                id: event.id,
                summary: event.summary,
                title: event.summary,
                start: typeof event.start === 'object' ? (event.start.dateTime || event.start.date) : event.start,
                end: typeof event.end === 'object' ? (event.end.dateTime || event.end.date) : event.end,
                description: event.description,
                creator: event.creator,
                organizer: event.organizer,
                iCalUID: event.iCalUID,
                reminders: event.reminders,
                eventType: event.eventType,
                ...event.extendedProperties?.private,
            }));
        } catch (error) {
            log.error("FethGoogleCalendarUseCase failed", error as Error);
            throw error;
        };
    };
};