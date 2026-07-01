import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoSanitize from "mongo-sanitize";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import logger from "./config/logger.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import { ApiResponse } from "./utils/ApiResponse.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import superAdminRouter from "./routes/superAdminRoutes.js";
import profileRouter from "./routes/profileRoutes.js";

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS with configurations
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
  })
);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Parse Cookie header and populate req.cookies
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize(req.body);
  if (req.query) req.query = mongoSanitize(req.query);
  if (req.params) req.params = mongoSanitize(req.params);
  next();
});

// Configure Morgan HTTP logger to output to Winston
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  })
);

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes."
});
app.use("/api", limiter);

// Placeholder welcome route
app.get("/api/v1/health", (req, res) => {
  res.status(200).json(new ApiResponse(200, { status: "UP" }, "LMS API is running smoothly"));
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/super-admin", superAdminRouter);
app.use("/api/v1/super-admin/profiles", profileRouter);

// 404 handler for unknown routes
app.all("*", (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler Middleware
app.use(errorHandler);

export { app };
