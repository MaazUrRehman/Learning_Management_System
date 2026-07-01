import { AcademicSession } from "../models/AcademicSession.js";
import { ApiError } from "../utils/ApiError.js";
import logger from "../config/logger.js";

/**
 * Create a new academic session.
 * Only one session can be marked as current at a time.
 */
export const createAcademicSession = async (data) => {
  const { name, startDate, endDate, isCurrent } = data;

  const existing = await AcademicSession.findOne({ name });
  if (existing) {
    throw new ApiError(409, `Academic session '${name}' already exists`);
  }

  // If this session is set as current, unset any existing current session
  if (isCurrent) {
    await AcademicSession.updateMany({ isCurrent: true }, { isCurrent: false });
  }

  const session = await AcademicSession.create({ name, startDate, endDate, isCurrent: isCurrent || false });

  logger.info(`Academic session created: ${session.name}`);
  return session;
};

/**
 * Get all academic sessions.
 */
export const getAllAcademicSessions = async () => {
  return await AcademicSession.find().sort({ startDate: -1 });
};

/**
 * Get a single academic session by ID.
 */
export const getAcademicSessionById = async (sessionId) => {
  const session = await AcademicSession.findById(sessionId);
  if (!session) throw new ApiError(404, "Academic session not found");
  return session;
};

/**
 * Get the currently active academic session.
 */
export const getCurrentAcademicSession = async () => {
  const session = await AcademicSession.findOne({ isCurrent: true });
  if (!session) throw new ApiError(404, "No active academic session found");
  return session;
};

/**
 * Update an academic session. Handles current session switching.
 */
export const updateAcademicSession = async (sessionId, data) => {
  const session = await AcademicSession.findById(sessionId);
  if (!session) throw new ApiError(404, "Academic session not found");

  if (data.isCurrent === true) {
    await AcademicSession.updateMany({ _id: { $ne: sessionId }, isCurrent: true }, { isCurrent: false });
  }

  const updated = await AcademicSession.findByIdAndUpdate(sessionId, { $set: data }, { new: true, runValidators: true });
  logger.info(`Academic session updated: ${updated.name}`);
  return updated;
};

/**
 * Delete an academic session.
 */
export const deleteAcademicSession = async (sessionId) => {
  const session = await AcademicSession.findById(sessionId);
  if (!session) throw new ApiError(404, "Academic session not found");
  if (session.isCurrent) throw new ApiError(400, "Cannot delete the currently active academic session");
  await AcademicSession.findByIdAndDelete(sessionId);
  logger.info(`Academic session deleted: ${session.name}`);
};
