import { kafkaConfig } from "../../config/env";
import { log } from "../../shared/logger/logger";
import { handler, processEventWrapperUseCase } from ".";
import { kafkaConsumer } from "../../infrastructure/messaging";
import { MBSSubKafkaEventPayload } from "../../application/dtos/kafka.dto";
import { IKafkaConsumerAdapter } from "../../domain/interfaces/messaging/IKafkaConsumerAdapter";

class KafkaController {
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
                    await processEventWrapperUseCase.execute({
                        businessUseCase: useCase,
                        eventData,
                        topic,
                        payloadExtractor: (payload: MBSSubKafkaEventPayload) => payload.mbsData
                    });
                });
            };

            await this.kafkaConsumer.startConsumer();
        } catch (error) {
            log.error("KafkaController startListening failed : ", error as Error);
        };
    };
};

export const kafkaController = new KafkaController(kafkaConsumer)