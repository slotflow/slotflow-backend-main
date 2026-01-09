import dotenv from 'dotenv';
dotenv.config();

import { Validator } from '../shared/validator/validator';

const validator = new Validator();

export const appConfig = {
    nodeEnv: validator.requireEnv("NODE_ENV"),
    port: validator.requireNumber("PORT"),
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
    googleCallbackUrl: validator.requireEnv("GOOGLE_CALLBACK_URL_DEV"),
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
    broker1: validator.requireEnv("KAFKA_BROKER_1"),
    broker2: validator.requireEnv("KAFKA_BROKER_2"),
    broker3: validator.requireEnv("KAFKA_BROKER_3"),

    topics: {
        pub: {
            sendOtp: validator.requireEnv("KAFKA_SENDOTP_TOPIC"),
            registerSuccess: validator.requireEnv("KAFKA_REGISTER_SUCCESS_TOPIC"),
            adminProviderReview: validator.requireEnv("KAFKA_ADMIN_PROVIDER_REVIEW_TOPIC"),
            accountBlockStatus: validator.requireEnv("KAFKA_ACCOUNT_BLOCK_STATUS_TOPIC"),
            accountTrustStatus: validator.requireEnv("KAFKA_ACCOUNT_TRUST_STATUS_TOPIC"),
            gotAppointment: validator.requireEnv("KAFKA_GOT_APPOINTMENT_TOPIC"),
            appointmentStatus: validator.requireEnv("KAFKA_APPOINTMENT_STATUS_TOPIC"),
            userPayment: validator.requireEnv("KAFKA_USER_PAYMENT_STATUS_TOPIC"),
            providerPayment: validator.requireEnv("KAFKA_PROVIDER_PAYMENT_STATUS_TOPIC"),
            providerPayout: validator.requireEnv("KAFKA_PROVIDER_PAYOUT_TOPIC"),
            appConnect: validator.requireEnv("KAFKA_APP_CONNECT_TOPIC"),
            trialSubscription: validator.requireEnv("KAFKA_TRIAL_SUBSCRIPTION_TOPIC"),

            googleCalendarCreateRequest: validator.requireEnv("KAFKA_GOOGLE_CALENDAR_CREATE_REQUEST_TOPIC"),
            googleCalendarUpdateRequest: validator.requireEnv("KAFKA_GOOGLE_CALENDAR_UPDATE_REQUEST_TOPIC"),
        },
        sub: {
            googleCalendarCreateSuccess: validator.requireEnv("KAFKA_GOOGLE_CALENDAR_CREATE_SUCCESS_TOPIC"),
            googleCalendarCreateFailed: validator.requireEnv("KAFKA_GOOGLE_CALENDAR_CREATE_FAILED_TOPIC"),

            googleCalendarUpdateSuccess: validator.requireEnv("KAFKA_GOOGLE_CALENDAR_UPDATE_SUCCESS_TOPIC"),
            googleCalendarUpdateFailed: validator.requireEnv("KAFKA_GOOGLE_CALENDAR_UPDATE_FAILED_TOPIC"),
        }
    },
};
