import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createAcademicSession,
  getAllAcademicSessions,
  getAcademicSessionById,
  getCurrentAcademicSession,
  updateAcademicSession,
  deleteAcademicSession,
} from "../services/academicSessionService.js";

export const createAcademicSessionHandler = asyncHandler(async (req, res) => {
  const session = await createAcademicSession(req.body);
  return res.status(201).json(new ApiResponse(201, session, "Academic session created successfully"));
});

export const getAllAcademicSessionsHandler = asyncHandler(async (req, res) => {
  const sessions = await getAllAcademicSessions();
  return res.status(200).json(new ApiResponse(200, sessions, "Academic sessions fetched successfully"));
});

export const getAcademicSessionByIdHandler = asyncHandler(async (req, res) => {
  const session = await getAcademicSessionById(req.params.sessionId);
  return res.status(200).json(new ApiResponse(200, session, "Academic session fetched successfully"));
});

export const getCurrentAcademicSessionHandler = asyncHandler(async (req, res) => {
  const session = await getCurrentAcademicSession();
  return res.status(200).json(new ApiResponse(200, session, "Current academic session fetched successfully"));
});

export const updateAcademicSessionHandler = asyncHandler(async (req, res) => {
  const session = await updateAcademicSession(req.params.sessionId, req.body);
  return res.status(200).json(new ApiResponse(200, session, "Academic session updated successfully"));
});

export const deleteAcademicSessionHandler = asyncHandler(async (req, res) => {
  await deleteAcademicSession(req.params.sessionId);
  return res.status(200).json(new ApiResponse(200, {}, "Academic session deleted successfully"));
});
