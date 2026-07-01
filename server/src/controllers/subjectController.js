import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createSubject, getAllSubjects, getSubjectById, updateSubject, deleteSubject } from "../services/subjectService.js";

export const createSubjectHandler = asyncHandler(async (req, res) => {
  const subject = await createSubject(req.body);
  return res.status(201).json(new ApiResponse(201, subject, "Subject created successfully"));
});

export const getAllSubjectsHandler = asyncHandler(async (req, res) => {
  const subjects = await getAllSubjects(req.query.classId);
  return res.status(200).json(new ApiResponse(200, subjects, "Subjects fetched successfully"));
});

export const getSubjectByIdHandler = asyncHandler(async (req, res) => {
  const subject = await getSubjectById(req.params.subjectId);
  return res.status(200).json(new ApiResponse(200, subject, "Subject fetched successfully"));
});

export const updateSubjectHandler = asyncHandler(async (req, res) => {
  const subject = await updateSubject(req.params.subjectId, req.body);
  return res.status(200).json(new ApiResponse(200, subject, "Subject updated successfully"));
});

export const deleteSubjectHandler = asyncHandler(async (req, res) => {
  await deleteSubject(req.params.subjectId);
  return res.status(200).json(new ApiResponse(200, {}, "Subject deleted successfully"));
});
