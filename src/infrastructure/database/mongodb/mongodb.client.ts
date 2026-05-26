import mongoose from 'mongoose';
import { log } from '../../../shared/logger/logger';
import { mongodbConfig } from '../../../config/env';
import { AppError } from '../../../shared/error/appError';
import { ERROR_CODES } from '../../../shared/utils/types';

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(mongodbConfig.mongoUri);
    log.info("MongoDB Connected...");
  } catch (error) {
    log.error("MongoDB Connection Error : ", error as Error);

    throw new AppError(
      "Database connection failed",
      500,
      false,
      ERROR_CODES.DB_CONNECTION_FAILED
    );
  }
};

export const disconnectMongoDB = async () => {
  try {
    await mongoose.disconnect();
    log.info("MongoDB Disconnected...");
  } catch (error) {
    log.error("MongoDB Disconnection Error : ", error as Error);

    throw new AppError(
      "Database disconnection failed",
      500,
      false,
      ERROR_CODES.DB_DISCONNECT_FAILED
    );
  }
};