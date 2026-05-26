import { connectMongoDB, disconnectMongoDB } from "../../infrastructure/database/mongodb/mongodb.client";

export const initDB = async () => {
  await connectMongoDB();
};

export const stopDB = async () => {
  await disconnectMongoDB();
};