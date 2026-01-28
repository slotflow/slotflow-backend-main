import { log } from "../../shared/logger/logger";
import { IKafkaConsumerAdapter } from "../../domain/interfaces/message/IKafkaConsumerAdapter";

export class KafkaGoogleCalendarController {

    constructor(
        private readonly kafkaGoogleCalendarConsumerAdapter: IKafkaConsumerAdapter
    ) { };

    async startListening(): Promise<void> {
        try {

        } catch (error) {
            log.error("google calendar controller startListening failed : ", error as Error);
        };
    };
};