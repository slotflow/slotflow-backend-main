import dotenv from 'dotenv';
dotenv.config();

export const mongoConfig = {
    mongoURL: process.env.NODE_ENV !== "development" ? process.env.MONGO_URI_DEV : process.env.MONGO_URI
}

export const mailConfig = {
    user: process.env.OFFICIAL_EMAIL,
    password: process.env.OFFICIALEMAIL_PASS
}

export const jwtConfig = {
    jwtSecret: process.env.JWT_SECRET,
}

export const appConfig = {
    nodeEnv: process.env.NODE_ENV
}

export const adminConfig = {
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD
}

export const awsConfig = {
    aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
    aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
    aws_region: process.env.AWS_REGION,
    aws_s3Bucket_name: process.env.AWS_S3_BUCKET_NAME,
}

export const redisConfig = {
    redisUrl: process.env.REDIS_URL,
    redisToken: process.env.REDIS_TOKEN
}

export const googleClientConfig = {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET
}

export const appUrl = {
    backendUrl: process.env.BACKEND_URL,
    frontendUrl: process.env.FRONTEND_URL
}

export const aesConfig = {
    aesSalt: process.env.AES_ENCRYPTION_SALT,
    algorithm: process.env.AES_ALGORITHM,
    ivLength: parseInt(process.env.AES_IV_LENGTH as string),
    inputEncoding: process.env.AES_INPUT_ENCODING,
    outputEncoding: process.env.AES_OUTPUT_ENCODING,
    separator: process.env.AES_SEPARATOR,
}