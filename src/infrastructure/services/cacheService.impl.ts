import { Redis } from "@upstash/redis";
import { redisConfig } from "../../config/env";
import { log } from "../../shared/logger/logger";
import { ICacheService } from "../../domain/interfaces/services/ICache.service";

export class CacheServiceImpl implements ICacheService {
    
    constructor(
        private redisClient: Redis
    ) { };

    async setBlockList(key: string, value: string): Promise<void> {
        try {
            const updatedKey: string = `user:block-status:${key}`;
            await this.redisClient.set(updatedKey, value, { ex: redisConfig.redisBlockListTtl });
        } catch (error) {
            log.error("setBlockList failed", error as Error);
            throw error;
        };
    };

    async getBlockList(key: string): Promise<string | null> {
        try {
            const updatedKey: string = `user:block-status:${key}`;
            return await this.redisClient.get(updatedKey);
        } catch (error) {
            log.error("getBlockList failed", error as Error);
            throw error;
        };
    };

    async deleteBlockList(key: string): Promise<void> {
        try {
            const updatedKey: string = `user:block-status:${key}`;
            await this.redisClient.del(updatedKey);
        } catch (error) {
            log.error("deleteBlockList failed", error as Error);
            throw error;
        };
    };

}