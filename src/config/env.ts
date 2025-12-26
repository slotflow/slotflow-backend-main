import dotenv from 'dotenv';
dotenv.config();

import { Validator } from '../shared/validator/validator';

const validator = new Validator();

export const appConfig = {
    nodeEnv: validator.requireEnv("NODE_ENV"),
};

export const mongoConfig = {
    mongoURL:
        appConfig.nodeEnv === "development"
            ? validator.requireEnv("MONGO_URI_DEV")
            : validator.requireEnv("MONGO_URI"),
};

export const jwtConfig = {
    jwtSecret: validator.requireEnv("JWT_SECRET"),
};

export const mailConfig = {
    user: validator.requireEnv("OFFICIAL_EMAIL"),
    password: validator.requireEnv("OFFICIAL_EMAIL_PASS"),
};

export const adminConfig = {
    adminEmail: validator.requireEnv("ADMIN_EMAIL"),
    adminPassword: validator.requireEnv("ADMIN_PASSWORD"),
};

export const awsConfig = {
    awsAccessKeyId: validator.requireEnv("AWS_ACCESS_KEY_ID"),
    awsSecretAccessKey: validator.requireEnv("AWS_SECRET_ACCESS_KEY"),
    awsRegion: validator.requireEnv("AWS_REGION"),
    awsS3BucketName: validator.requireEnv("AWS_S3_BUCKET_NAME"),
    awsUrlExpires: validator.requireNumber("AWS_URL_EXPIRY_SECONDS"),
};

export const redisConfig = {
    redisUrl: validator.requireEnv("REDIS_URL"),
    redisToken: validator.requireEnv("REDIS_TOKEN"),
    redisTtl: validator.requireNumber("REDIS_TTL_SECONDS"),
};

export const googleClientConfig = {
    googleClientId: validator.requireEnv("GOOGLE_CLIENT_ID"),
    googleClientSecret: validator.requireEnv("GOOGLE_CLIENT_SECRET"),
};

export const appUrlConfig = {
    backendUrl: validator.requireEnv("BACKEND_URL"),
    frontendUrl: validator.requireEnv("FRONTEND_URL"),
};

export const aesConfig = {
    aesSalt: validator.requireEnv("AES_ENCRYPTION_SALT"),
    algorithm: validator.requireEnv("AES_ALGORITHM"),
    ivLength: validator.requireNumber("AES_IV_LENGTH"),
    inputEncoding: validator.requireEnv("AES_INPUT_ENCODING"),
    outputEncoding: validator.requireEnv("AES_OUTPUT_ENCODING"),
    separator: ":",
};

export const stripeConfig = {
    stripeSecretKey: validator.requireEnv("STRIPE_SECRET_KEY"),
};

export const kafkaConfig = {
    clientId: validator.requireEnv("KAFKA_CLIENT_ID"),
    groupId: validator.requireEnv("KAFKA_GROUP_ID"),
    brokers: validator.requireEnv("KAFKA_BROKERS").split(","),
    otpSendTopic: validator.requireEnv("KAFKA_SENDOTP_TOPIC"),
};