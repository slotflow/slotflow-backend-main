import { handler } from ".";
import { kafkaConfig } from "../../config/env";
import { log } from "../../shared/logger/logger";
import { IKafkaConsumerAdapter } from "../../domain/interfaces/messaging/IKafkaConsumerAdapter";

export class KafkaController {

    constructor(
        private readonly kafkaConsumer: IKafkaConsumerAdapter
    ) { };

    async startListening(): Promise<void> {
        try {
            log.info("start listening kafka controller");

            for (const [key, topic] of Object.entries(kafkaConfig.topics.sub)) {
                const useCase = handler[key as keyof typeof handler];
                if (!useCase) continue;

                await this.kafkaConsumer.subscribe(topic, async ({ message }) => {
                    if (!message.value) return;
                    const eventData = JSON.parse(message.value.toString());
                    await useCase.execute(eventData);
                });
            };

            await this.kafkaConsumer.startConsumer();
        } catch (error) {
            log.error("KafkaController startListening failed : ", error as Error);
        };
    };
};