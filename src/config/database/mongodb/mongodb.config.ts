import mongoose from 'mongoose';
import { mongodbConfig } from '../../env';
import { log } from '../../../shared/logger/logger';

const connectDB = async () => {
    try {
        await mongoose.connect(mongodbConfig.mongoUri);
        log.info("MngoDB Connected...");
    } catch (error) {
        log.error("MongoDB Connection Error : ", error as Error);
        throw new Error("Databse connection failed");
    }
}

export default connectDB;