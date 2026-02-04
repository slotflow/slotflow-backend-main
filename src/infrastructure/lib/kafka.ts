import { Kafka, logLevel } from "kafkajs";
import { kafkaConfig } from "../../config/env";

export const kafkaClient = new Kafka({
  clientId: kafkaConfig.clientId,
  brokers: kafkaConfig.brokers,
  logLevel: logLevel.ERROR,
});
