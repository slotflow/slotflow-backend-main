import { KafkaClientAdapter } from "../messaging/kafka";
import { IKafkaService } from "../../domain/interfaces/services/IKafka.service";
import { KafkaConsumeHandler, KafkaSendPayload } from "../../application/dtos/common.dto";

export class KafkaServiceImpl implements IKafkaService {

  constructor(
    private readonly kafkaClient: KafkaClientAdapter
  ) {}

  async send<T>(payload: KafkaSendPayload<T>): Promise<void> {
    const producer = this.kafkaClient.getProducer();

    await producer.send({
      topic: payload.topic,
      messages: [
        {
          key: payload.key,
          value: JSON.stringify(payload.message),
        },
      ],
    });
  }

  async consume<T>(handler: KafkaConsumeHandler<T>): Promise<void> {
    await this.kafkaClient.runConsumer(async ({ topic, partition, message }) => {
      if (!message?.value) return;

      const parsedMessage = JSON.parse(message.value.toString()) as T;

      await handler({
        topic,
        partition,
        message: parsedMessage,
      });
    });
  }
}
