import { Subject } from "../models/Subject.js";
import { Class } from "../models/Class.js";
import { ApiError } from "../utils/ApiError.js";
import logger from "../config/logger.js";

export const createSubject = async (data) => {
  const cls = await Class.findById(data.classId);
  if (!cls) throw new ApiError(404, "Class not found");

  data.code = data.code.toUpperCase();
  const existing = await Subject.findOne({ code: data.code, classId: data.classId });
  if (existing) throw new ApiError(409, `Subject code '${data.code}' already exists in this class`);

  const subject = await Subject.create(data);
  logger.info(`Subject created: ${subject.name} (${subject.code})`);
  return subject;
};

export const getAllSubjects = async (classId) => {
  const filter = classId ? { classId } : {};
  return await Subject.find(filter)
    .populate("classId", "name code")
    .sort({ name: 1 });
};

export const getSubjectById = async (subjectId) => {
  const subject = await Subject.findById(subjectId).populate("classId", "name code");
  if (!subject) throw new ApiError(404, "Subject not found");
  return subject;
};

export const updateSubject = async (subjectId, data) => {
  const subject = await Subject.findById(subjectId);
  if (!subject) throw new ApiError(404, "Subject not found");
  if (data.code) data.code = data.code.toUpperCase();

  const updated = await Subject.findByIdAndUpdate(subjectId, { $set: data }, { new: true, runValidators: true })
    .populate("classId", "name code");
  logger.info(`Subject updated: ${updated.name}`);
  return updated;
};

export const deleteSubject = async (subjectId) => {
  const subject = await Subject.findById(subjectId);
  if (!subject) throw new ApiError(404, "Subject not found");
  await Subject.findByIdAndDelete(subjectId);
  logger.info(`Subject deleted: ${subject.name}`);
};
