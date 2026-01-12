import { Kafka, Consumer } from "kafkajs";
import { log } from "../../shared/logger/logger";
import { MessageHandler } from "../../application/dtos/kafka.dtos";
import { IKafkaConsumerAdapter } from "../../domain/interfaces/message/IKafkaConsumerAdapter";

export class KafkaConsumerAdapter implements IKafkaConsumerAdapter {
    private consumer!: Consumer;
    private handlers = new Map<string, MessageHandler>();

    constructor(
        private readonly kafka: Kafka,
        private readonly groupId: string,
    ) { }

    async connectConsumer(): Promise<void> {
        this.consumer = this.kafka.consumer({ groupId: this.groupId });
        await this.consumer.connect();
        log.info(`Kafka consumer connected [group=${this.groupId}]`);
    }

    async subscribe(topic: string, handler: MessageHandler): Promise<void> {
        await this.consumer.subscribe({ topic, fromBeginning: false });
        this.handlers.set(topic, handler);
        log.info(`Subscribed to topic: ${topic}`);
    }

    async startConsumer(): Promise<void> {
        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const handler = this.handlers.get(topic);
                if (!handler) return;
                await handler({ topic, partition, message });
            },
        });

        log.info("Kafka consumer running");
    }

};