import { MessageHandler } from "../../../application/dtos/kafka.dto";

export interface IKafkaConsumerAdapter {

  connectConsumer(): Promise<void>;

  subscribe(topic: string, handler: MessageHandler): Promise<void>;

  startConsumer(): Promise<void>;

  disconnectConsumer(): Promise<void>;

};
