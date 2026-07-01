import http from "http";
import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./config/socket.js";
import logger from "./config/logger.js";

// Load environment variables
dotenv.config();

// Handle uncaught exceptions globally
process.on("uncaughtException", (err) => {
  logger.error(`UNCAUGHT EXCEPTION! Server shutting down... Error: ${err.message}`);
  logger.error(err.stack);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

// Initialize Database connection
connectDB()
  .then(() => {
    // Create HTTP Server
    const server = http.createServer(app);

    // Initialize Socket.io Server wrapper
    initSocket(server);

    // Start server
    server.listen(PORT, () => {
      logger.info(`Server is running in ${process.env.NODE_ENV} mode on port: ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      logger.error(`UNHANDLED REJECTION! Server shutting down... Error: ${err.message}`);
      logger.error(err.stack);
      server.close(() => {
        process.exit(1);
      });
    });
  })
  .catch((err) => {
    logger.error(`MongoDB database connection failed during server startup: ${err.message}`);
  });
