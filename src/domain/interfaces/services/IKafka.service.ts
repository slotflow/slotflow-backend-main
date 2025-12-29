import { KafkaConsumeHandler, KafkaSendPayload } from "../../../application/dtos/common.dto";

export interface IKafkaService {

    send<T>(payload: KafkaSendPayload<T>): Promise<void>;

    consume<T>(handler: KafkaConsumeHandler<T>): Promise<void>;

};