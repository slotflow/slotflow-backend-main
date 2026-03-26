import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { ICacheService } from "../../../domain/interfaces/services/ICache.service";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { AdminChangeProviderBlockStatusRequest, AdminChangeProviderBlockStatusResponse } from "../../dtos/admin.dto";
import { EventEnvelope, SendAccountBlockStatusEvent } from "../../dtos/kafka.dtos";
import { notificationContentMap } from "../../../shared/utils/constants";

export class ChangeProviderBlockStatusUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private kafkaProducer: IKafkaProducerAdapter,
        private cacheService: ICacheService
    ) { };

    async execute(payload: AdminChangeProviderBlockStatusRequest): Promise<AdminChangeProviderBlockStatusResponse> {
        try {
            const { providerId, isBlocked } = payload;

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("User not found.");

            if (provider.isBlocked === isBlocked) {
                isBlocked ? provider.unblock() : provider.block();
            };

            const updatedProvider = await this.providerRepository.update(provider);
            if (!updatedProvider) throw new Error("Provider not found");

            if (updatedProvider.isBlocked) {
                await this.cacheService.setBlockList(providerId, JSON.stringify(isBlocked));
            } else {
                await this.cacheService.deleteBlockList(providerId);
            };

            await this.kafkaProducer.publish<EventEnvelope<SendAccountBlockStatusEvent>>(kafkaConfig.topics.pub.accountBlockStatus, {
                eventId: uuidv4(),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date().toISOString(),
                payload: {
                    emailData: {
                        blocked: updatedProvider.isBlocked,
                        email: provider.email,
                        name: provider.username,
                    },
                    notificationData: {
                        userId: provider._id,
                        pushNotification: provider.allowPushNotification ?? false,
                        title: notificationContentMap.accountBlockStatus.title,
                        body: notificationContentMap.accountBlockStatus.body(updatedProvider.isBlocked),
                    },
                },
            });

            return { providerId, isBlocked: updatedProvider.isBlocked };
        } catch (error) {
            log.error("ChangeProviderBlockStatusUseCase failed", error as Error);
            throw error;
        };
    };
};