import mongoose from 'mongoose';
import { mongodbConfig } from '../../env';

const connectDB = async () => {
    try {
        await mongoose.connect(mongodbConfig.mongoURL as string);
        console.log("MngoDB Connected...");
    } catch (error) {
        console.error("MongoDB Connection Error : ", error);
        throw new Error("Databse connection failed");
    }
}

export default connectDB;