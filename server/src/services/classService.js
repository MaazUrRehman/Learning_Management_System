import { Class } from "../models/Class.js";
import { Section } from "../models/Section.js";
import { ApiError } from "../utils/ApiError.js";
import logger from "../config/logger.js";

// ─── Class Services ───────────────────────────────────────────────────────────

export const createClass = async (data) => {
  const existing = await Class.findOne({ $or: [{ name: data.name }, { code: data.code.toUpperCase() }] });
  if (existing) throw new ApiError(409, "A class with this name or code already exists");

  const newClass = await Class.create({ ...data, code: data.code.toUpperCase() });
  logger.info(`Class created: ${newClass.name}`);
  return newClass;
};

export const getAllClasses = async () => {
  return await Class.find().sort({ name: 1 });
};

export const getClassById = async (classId) => {
  const cls = await Class.findById(classId);
  if (!cls) throw new ApiError(404, "Class not found");
  return cls;
};

export const updateClass = async (classId, data) => {
  const cls = await Class.findById(classId);
  if (!cls) throw new ApiError(404, "Class not found");

  if (data.code) data.code = data.code.toUpperCase();

  const updated = await Class.findByIdAndUpdate(classId, { $set: data }, { new: true, runValidators: true });
  logger.info(`Class updated: ${updated.name}`);
  return updated;
};

export const deleteClass = async (classId) => {
  const cls = await Class.findById(classId);
  if (!cls) throw new ApiError(404, "Class not found");

  // Check if any sections belong to this class
  const sectionCount = await Section.countDocuments({ classId });
  if (sectionCount > 0) {
    throw new ApiError(400, `Cannot delete class — ${sectionCount} section(s) are still linked to it`);
  }

  await Class.findByIdAndDelete(classId);
  logger.info(`Class deleted: ${cls.name}`);
};

// ─── Section Services ─────────────────────────────────────────────────────────

export const createSection = async (data) => {
  const cls = await Class.findById(data.classId);
  if (!cls) throw new ApiError(404, "Class not found for this section");

  const existing = await Section.findOne({ name: data.name, classId: data.classId });
  if (existing) throw new ApiError(409, `Section '${data.name}' already exists in this class`);

  const section = await Section.create(data);
  logger.info(`Section created: ${section.name} in class ${cls.name}`);
  return section;
};

export const getSectionsByClass = async (classId) => {
  const cls = await Class.findById(classId);
  if (!cls) throw new ApiError(404, "Class not found");

  return await Section.find({ classId })
    .populate("classId", "name code")
    .populate("classTeacherId", "firstName lastName email")
    .sort({ name: 1 });
};

export const getAllSections = async () => {
  return await Section.find()
    .populate("classId", "name code")
    .populate("classTeacherId", "firstName lastName email")
    .sort({ name: 1 });
};

export const getSectionById = async (sectionId) => {
  const section = await Section.findById(sectionId)
    .populate("classId", "name code")
    .populate("classTeacherId", "firstName lastName email");
  if (!section) throw new ApiError(404, "Section not found");
  return section;
};

export const updateSection = async (sectionId, data) => {
  const section = await Section.findById(sectionId);
  if (!section) throw new ApiError(404, "Section not found");

  const updated = await Section.findByIdAndUpdate(sectionId, { $set: data }, { new: true, runValidators: true })
    .populate("classId", "name code")
    .populate("classTeacherId", "firstName lastName email");

  logger.info(`Section updated: ${updated.name}`);
  return updated;
};

export const deleteSection = async (sectionId) => {
  const section = await Section.findById(sectionId);
  if (!section) throw new ApiError(404, "Section not found");
  await Section.findByIdAndDelete(sectionId);
  logger.info(`Section deleted: ${section.name}`);
};
