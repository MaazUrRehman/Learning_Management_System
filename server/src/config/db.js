import mongoose from "mongoose";
import logger from "./logger.js";

/**
 * Establish connection to MongoDB database.
 */
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB connected successfully! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection FAILED: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
