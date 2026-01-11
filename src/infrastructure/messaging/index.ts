// message instance

import { kafkaConfig } from "../../config/env";
import { KafkaClientAdapter } from "./kafkaClientAdapter";
import { IKafkaClientAdapter } from "../../domain/interfaces/message/IKafkaClientAdapter";

export const kafkaClientAdapter: IKafkaClientAdapter = new KafkaClientAdapter(
  kafkaConfig.clientId,
  kafkaConfig.groups.groupId,
  kafkaConfig.brokers
);
