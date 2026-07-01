import { Server } from "socket.io";
import logger from "./logger.js";

let io = null;

/**
 * Initialize Socket.io server configuration.
 * @param {HttpServer} server - The HTTP server instance.
 */
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    logger.info(`Socket client connected: ${socket.id}`);

    // Join custom room based on user authorization (e.g. user ID / roles)
    socket.on("join-user-room", (userId) => {
      socket.join(`user:${userId}`);
      logger.debug(`Socket ${socket.id} joined user room: user:${userId}`);
    });

    socket.on("join-room", (roomName) => {
      socket.join(roomName);
      logger.debug(`Socket ${socket.id} joined room: ${roomName}`);
    });

    socket.on("disconnect", () => {
      logger.info(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Fetch active Socket.io server instance.
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized!");
  }
  return io;
};
