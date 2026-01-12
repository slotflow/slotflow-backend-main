import { kafkaClient } from "../lib/kafka";
import { kafkaConfig } from "../../config/env";
import { KafkaConsumerAdapter } from "./kafkaConsumerAdapter";
import { KafkaProducerAdapter } from "./kafkaProducerAdapter";
import { IKafkaConsumerAdapter } from "../../domain/interfaces/message/IKafkaConsumerAdapter";
import { IKafkaProducerAdapter } from "../../domain/interfaces/message/IKafkaProducerAdapter";

// Kafka single consumer
export const kafkaConsumer: IKafkaConsumerAdapter = new KafkaConsumerAdapter(
  kafkaClient,
  kafkaConfig.groups.groupId
);

// Kafka Single producer
export const kafkaProducer: IKafkaProducerAdapter = new KafkaProducerAdapter(
  kafkaClient
);

