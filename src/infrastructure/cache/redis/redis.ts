import { Redis } from "@upstash/redis";
import { redisConfig } from "../../config/env";

export const redisClient = new Redis({
    url: redisConfig.redisUrl,
    token: redisConfig.redisToken,
});