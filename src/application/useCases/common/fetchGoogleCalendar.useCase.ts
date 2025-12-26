import { log } from "../../../shared/logger/logger";
import { UserBookingFetchingFromCalendar } from "../../dtos/common.dto";
import { IAesEncryption } from "../../../domain/interfaces/services/IAesEncryption.service";
import { IGoogleCalendarGateway } from "../../../domain/interfaces/services/IGoogleCalendarGateway";
import { ICredentialRepository } from "../../../domain/interfaces/repositories/ICredentialRepository";

export class FethGoogleCalendarUseCase {
    constructor(
        private credentialRepository: ICredentialRepository,
        private aesEncryption: IAesEncryption,
        private googleCalendarGateway: IGoogleCalendarGateway
    ) { }

    async execute(userId: string): Promise<Array<UserBookingFetchingFromCalendar>> {
        try {
            const credential = await this.credentialRepository.findById(userId);
        if (!credential) {
            throw new Error("Credential not found");
        }

        const accessToken = await this.aesEncryption.decrypt(
            credential.accessToken
        );

        const events = await this.googleCalendarGateway.fetchEvents(
            accessToken
        );

        return events.map((event: UserBookingFetchingFromCalendar) => ({
            id: event.id,
            start: event.start,
            end: event.end,
            summary: event.summary,
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
            throw new Error("Calendar events fetching failed");
        }
    }
}