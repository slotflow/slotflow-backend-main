import { Kafka, Consumer } from "kafkajs";
import { log } from "../../shared/logger/logger";
import { AppError } from "../../shared/error/appError";
import { ERROR_CODES } from "../../shared/utils/types";
import { MessageHandler } from "../../application/dtos/kafka.dto";
import { IKafkaConsumerAdapter } from "../../domain/interfaces/messaging/IKafkaConsumerAdapter";

export class KafkaConsumerAdapter implements IKafkaConsumerAdapter {
    private consumer!: Consumer;
    private handlers = new Map<string, MessageHandler>();

    constructor(
        private readonly kafka: Kafka,
        private readonly groupId: string,
    ) { }

    async connectConsumer(): Promise<void> {
        try {
            this.consumer = this.kafka.consumer({ groupId: this.groupId });
            await this.consumer.connect();

            log.info(`Kafka consumer connected [group=${this.groupId}]`);
        } catch (error) {
            log.error("Kafka connect failed:", error as Error);

            throw new AppError(
                "Kafka connection failed",
                500,
                false,
                ERROR_CODES.KAFKA_CONNECTION_FAILED
            );
        }
    }

    async subscribe(topic: string, handler: MessageHandler): Promise<void> {
        try {
            await this.consumer.subscribe({ topic, fromBeginning: false });
            this.handlers.set(topic, handler);

            log.info(`Subscribed to topic: ${topic}`);
        } catch (error) {
            log.error(`Kafka subscribe failed [topic=${topic}]`, error as Error);

            throw new AppError(
                "Kafka subscription failed",
                500,
                false,
                ERROR_CODES.KAFKA_SUBSCRIBE_FAILED
            );
        }
    }

    async startConsumer(): Promise<void> {
        try {
            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    const handler = this.handlers.get(topic);
                    if (!handler) return;

                    try {
                        await handler({ topic, partition, message });
                    } catch (error) {
                        log.error(
                            `Kafka handler failed [topic=${topic}, partition=${partition}]`,
                            error as Error
                        );
                    }
                },
            });

            log.info("Kafka consumer running");
        } catch (error) {
            log.error("Kafka consumer run failed:", error as Error);

            throw new AppError(
                "Kafka consumer failed to start",
                500,
                false,
                ERROR_CODES.KAFKA_CONSUMER_FAILED
            );
        }
    }

    async disconnectConsumer(): Promise<void> {
        try {
            await this.consumer.disconnect();
            log.info("Kafka consumer disconnected");
        } catch (error) {
            log.error("Kafka disconnect failed:", error as Error);

            throw new AppError(
                "Kafka disconnect failed",
                500,
                false,
                ERROR_CODES.KAFKA_DISCONNECT_FAILED
            );
        }
    }

};