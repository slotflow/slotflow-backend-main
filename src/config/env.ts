import dotenv from 'dotenv'
dotenv.config();

import { Validator } from '../shared/validator/validator';

const validator = new Validator();

export const appConfig = {
    port: validator.requireNumber("PORT"),
    nodeEnv: validator.requireEnv("NODE_ENV"),
    isDev: validator.requireEnv("NODE_ENV") === "development",
    serviceName: validator.requireEnv("SERVICE_NAME"),
};

export const mongodbConfig = {
    mongoUri: appConfig.isDev ? validator.requireEnv("MONGO_URI_DEV") : validator.requireEnv("MONGO_URI"),
};

export const serviceConfig = {
    frontendUrl: appConfig.isDev ? validator.requireEnv("FRONTEND_URL_DEV") : validator.requireEnv("FRONTEND_URL"),
    apiGatewayUrl: appConfig.isDev ? validator.requireEnv("API_GATEWAY_URL_DEV") : validator.requireEnv("API_GATEWAY_URL"),
    mainBackendServiceUrl: appConfig.isDev ? validator.requireEnv("MAIN_BACKEND_SERVICE_URL_DEV") : validator.requireEnv("MAIN_BACKEND_SERVICE_URL"),
    realtimeServiceUrl: appConfig.isDev ? validator.requireEnv("REALTIME_SERVICE_URL_DEV") : validator.requireEnv("REALTIME_SERVICE_URL"),
    notificationServiceUrl: appConfig.isDev ? validator.requireEnv("NOTIFICATION_SERVICE_URL_DEV") : validator.requireEnv("NOTIFICATION_SERVICE_URL"),
    paymentServiceUrl: appConfig.isDev ? validator.requireEnv("PAYMENT_SERVICE_URL_DEV") : validator.requireEnv("PAYMENT_SERVICE_URL"),
};

export const jwtConfig = {
    jwtSecret: validator.requireEnv("JWT_SECRET"),
};

export const officialConfig = {
    email: validator.requireEnv("OFFICIAL_EMAIL"),
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
    redisBlockListTtl: validator.requireNumber("REDIS_TTL_SECONDS_BLOCKLIST"),
    redisOtpTtl: validator.requireNumber("REDIS_TTL_SECONDS_OTP"),
    redisSignedUrlTtl: validator.requireNumber("REDIS_TTL_SECONDS_SIGNED_URL"),
};

export const googleClientConfig = {
    googleClientId: validator.requireEnv("GOOGLE_CLIENT_ID"),
    googleClientSecret: validator.requireEnv("GOOGLE_CLIENT_SECRET"),
    googleCallbackUrl: validator.requireEnv("GOOGLE_CALLBACK_URL_DEV"),
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
    stripeSecretKey: appConfig.isDev ? validator.requireEnv("STRIPE_SECRET_KEY_DEV") : validator.requireEnv("STRIPE_SECRET_KEY"),
};

export const otelConfig = {
    otelExporterOtlpTracesEndpoint: appConfig.isDev ? validator.requireEnv("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT_DEV") : validator.requireEnv("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT"),
    otelExporterOtlpMetricsEndpoint: appConfig.isDev ? validator.requireEnv("OTEL_EXPORTER_OTLP_METRICS_ENDPOINT_DEV") : validator.requireEnv("OTEL_EXPORTER_OTLP_METRICS_ENDPOINT"),
    otelExporterOtlpLogsEndpoint: appConfig.isDev ? validator.requireEnv("OTEL_EXPORTER_OTLP_LOGS_ENDPOINT_DEV") : validator.requireEnv("OTEL_EXPORTER_OTLP_LOGS_ENDPOINT"),
};

export const kafkaConfig = {
    clientId: validator.requireEnv("KAFKA_CLIENT_ID"),

    groups: {
        groupId: validator.requireEnv("KAFKA_GROUP_ID"),
    },

    brokers: [
        validator.requireEnv("KAFKA_BROKER_1"),
        // validator.requireEnv("KAFKA_BROKER_2"),
        // validator.requireEnv("KAFKA_BROKER_3"),
    ],

    topics: {
        dlqTopic: validator.requireEnv("KAFKA_DLQ_TOPIC"),

        sub: {
            googleCalendarSuccess: validator.requireEnv("KAFKA_GOOGLE_CALENDAR_SUCCESS"),
            googleCalendarFailed: validator.requireEnv("KAFKA_GOOGLE_CALENDAR_FAILED"),
            providerSubscriptionPaymentSuccess: validator.requireEnv("KAFKA_PROVIDER_SUBSCRIPTION_PAYMENT_SUCCESS"),
            userBookingPaymentSuccess: validator.requireEnv("KAFKA_USER_BOOKING_PAYMENT_SUCCESS"),
            stripeAccountCreated: validator.requireEnv("KAFKA_STRIPE_ACCOUNT_CREATED"),
            stripeCustomerCreated: validator.requireEnv("KAFKA_STRIPE_CUSTOMER_CREATED"),
            stripeAccountUpdateStatus: validator.requireEnv("KAFKA_STRIPE_ACCOUNT_UPDATE_STATUS"),
        },
        
        pub: {
            // MBS -> NS
            sendOtp: validator.requireEnv("KAFKA_SEND_OTP"),
            registerSuccess: validator.requireEnv("KAFKA_REGISTER_SUCCESS"),
            passwordReset: validator.requireEnv("KAFKA_PASSWORD_RESET"),
            passwordUpdate: validator.requireEnv("KAFKA_PASSWORD_UPDATE"),
            adminProviderReview: validator.requireEnv("KAFKA_ADMIN_PROVIDER_REVIEW"),
            accountBlockStatus: validator.requireEnv("KAFKA_ACCOUNT_BLOCK_STATUS"),
            accountTrustStatus: validator.requireEnv("KAFKA_ACCOUNT_TRUST_STATUS"),
            providerAppointmentStatusForUser: validator.requireEnv("KAFKA_PROVIDER_APPOINTMENT_STATUS_FOR_USER"),
            providerAppointmentStatusForProvider: validator.requireEnv("KAFKA_PROVIDER_APPOINTMENT_STATUS_FOR_PROVIDER"),
            appConnect: validator.requireEnv("KAFKA_APP_CONNECT"),
            providerTrialSubscription: validator.requireEnv("KAFKA_PROVIDER_TRIAL_SUBSCRIPTION"),
            createGoogleCalendarEvent: validator.requireEnv("KAFKA_GOOGLE_CALENDAR_EVENT_CREATE"),
            updateGoogleCalendarEvent: validator.requireEnv("KAFKA_GOOGLE_CALENDAR_EVENT_UPDATE"),

            // MBS -> NS
            gotAnAppointment: validator.requireEnv("KAFKA_GOT_AN_APPOINTMENT"),
            stripeAccountLinked: validator.requireEnv("KAFKA_STRIPE_ACCOUNT_LINKED"),
            
            // MBS -> NS, SS
            slotBooked: validator.requireEnv("KAFKA_SLOT_BOOKED"),
            planSubscribed: validator.requireEnv("KAFKA_PLAN_SUBSCRIBED"),
            stripeAccountStatusUpdated: validator.requireEnv("KAFKA_STRIPE_ACCOUNT_STATUS_UPDATED"),

        },
    },
};
