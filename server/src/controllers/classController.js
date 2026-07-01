import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createClass, getAllClasses, getClassById, updateClass, deleteClass,
  createSection, getSectionsByClass, getAllSections, getSectionById, updateSection, deleteSection,
} from "../services/classService.js";

// ─── Class Controllers ────────────────────────────────────────────────────────
export const createClassHandler = asyncHandler(async (req, res) => {
  const cls = await createClass(req.body);
  return res.status(201).json(new ApiResponse(201, cls, "Class created successfully"));
});

export const getAllClassesHandler = asyncHandler(async (req, res) => {
  const classes = await getAllClasses();
  return res.status(200).json(new ApiResponse(200, classes, "Classes fetched successfully"));
});

export const getClassByIdHandler = asyncHandler(async (req, res) => {
  const cls = await getClassById(req.params.classId);
  return res.status(200).json(new ApiResponse(200, cls, "Class fetched successfully"));
});

export const updateClassHandler = asyncHandler(async (req, res) => {
  const cls = await updateClass(req.params.classId, req.body);
  return res.status(200).json(new ApiResponse(200, cls, "Class updated successfully"));
});

export const deleteClassHandler = asyncHandler(async (req, res) => {
  await deleteClass(req.params.classId);
  return res.status(200).json(new ApiResponse(200, {}, "Class deleted successfully"));
});

// ─── Section Controllers ──────────────────────────────────────────────────────
export const createSectionHandler = asyncHandler(async (req, res) => {
  const section = await createSection(req.body);
  return res.status(201).json(new ApiResponse(201, section, "Section created successfully"));
});

export const getAllSectionsHandler = asyncHandler(async (req, res) => {
  const sections = await getAllSections();
  return res.status(200).json(new ApiResponse(200, sections, "Sections fetched successfully"));
});

export const getSectionsByClassHandler = asyncHandler(async (req, res) => {
  const sections = await getSectionsByClass(req.params.classId);
  return res.status(200).json(new ApiResponse(200, sections, "Sections fetched successfully"));
});

export const getSectionByIdHandler = asyncHandler(async (req, res) => {
  const section = await getSectionById(req.params.sectionId);
  return res.status(200).json(new ApiResponse(200, section, "Section fetched successfully"));
});

export const updateSectionHandler = asyncHandler(async (req, res) => {
  const section = await updateSection(req.params.sectionId, req.body);
  return res.status(200).json(new ApiResponse(200, section, "Section updated successfully"));
});

export const deleteSectionHandler = asyncHandler(async (req, res) => {
  await deleteSection(req.params.sectionId);
  return res.status(200).json(new ApiResponse(200, {}, "Section deleted successfully"));
});
