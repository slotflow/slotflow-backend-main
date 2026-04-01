import mongoose from 'mongoose';
import { log } from '../../../shared/logger/logger';
import { mongodbConfig } from '../../../config/env';

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(mongodbConfig.mongoUri);
    log.info("MongoDB Connected...");
  } catch (error) {
    log.error("MongoDB Connection Error : ", error as Error);
    throw new Error("Database connection failed");
  }
};

export const disconnectMongoDB = async () => {
  try {
    await mongoose.disconnect();
    log.info("MongoDB Disconnected...");
  } catch (error) {
    log.error("MongoDB Disconnection Error : ", error as Error);
    throw new Error("Database disconnection failed");
  }
};