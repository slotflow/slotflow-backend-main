import { kafkaClient } from "./kafka";
import { kafkaConfig } from "../../config/env";
import { KafkaConsumerAdapter } from "./kafkaConsumer.adapter.impl";
import { KafkaProducerAdapter } from "./kafkaProducer.adapter.impl";
import { IKafkaConsumerAdapter } from "../../application/interfaces/messaging/IKafkaConsumer.adapter";
import { IKafkaProducerAdapter } from "../../application/interfaces/messaging/IKafkaProducer.adapter";

// Kafka single consumer
export const kafkaConsumer: IKafkaConsumerAdapter = new KafkaConsumerAdapter(
  kafkaClient,
  kafkaConfig.groups.groupId,
);

// Kafka Single producer
export const kafkaProducer: IKafkaProducerAdapter = new KafkaProducerAdapter(kafkaClient);
