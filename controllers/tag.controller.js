const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const Tag = require("../models/Tag");
const Project = require("../models/Project");
const Task = require("../models/Task");

const tagController = {};

tagController.createNewTag = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  const { tagLabel, color, colorShade, projectId } = req.body;

  // Business logic validation
  if (projectId) {
    let tag = await Tag.findOne({ tagLabel, project: projectId });
    if (tag)
      return next(
        new AppError(
          400,
          "Tag already exists in this project",
          "Create New Tag Error"
        )
      );
  } else {
    // Check if tag already exists by createdBy
    let tag = await Tag.findOne({
      tagLabel,
      projectId: null,
      createdBy: currentUserId,
    });

    if (tag)
      return next(
        new AppError(400, "Tag already exists", "Create New Tag Error")
      );
  }

  // Process

  let tag = await Tag.create({
    tagLabel,
    color,
    colorShade,
    project: projectId ? projectId : null,
    createdBy: currentUserId,
  });

  // Response
  return sendResponse(res, 200, true, tag, null, "Create New Tag successfully");
});

tagController.getTags = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  let { page, limit, ...filter } = { ...req.query };

  // Business logic validation
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const allows = ["search", "projectId"];

  const filterKeys = Object.keys(filter);
  filterKeys.forEach((key) => {
    if (!allows.includes(key))
      throw new AppError(400, `Key ${key} is not allowed`, "Get Tags Error");
  });
  // Process

  const filterConditions = [];

  // query filters
  filterKeys.forEach((field) => {
    if (filter[field] !== undefined) {
      if (field === "search") {
        filterConditions.push({
          $or: [
            { tagLabel: { $regex: filter[field], $options: "i" } },
            { color: { $regex: filter[field], $options: "i" } },
          ],
        });
      } else if (field === "projectId") {
        filterConditions.push({ project: filter[field] });
      } else {
        filterConditions.push({ [field]: filter[field] });
      }
    }
  });

  // if no projectId, get tags created by current user and tags with projectId null
  if (!filter.projectId) {
    filterConditions.push({ project: null, createdBy: currentUserId });
  }

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await Tag.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let tags = await Tag.find(filterCriteria)
    .sort({ tagLabel: 1 })
    .collation({ locale: "en", strength: 2 })
    .skip(offset)
    .limit(limit);

  // Response
  return sendResponse(
    res,
    200,
    true,
    { tags, totalPages, count },
    null,
    "Get Tags successfully"
  );
});

tagController.updateSingleTag = catchAsync(async (req, res, next) => {
  // Get data from requests
  const tagId = req.params.tagId;

  // Business logic validation
  const tag = await Tag.findById(tagId);

  // Process
  const allows = ["tagLabel", "color", "colorShade"];

  allows.forEach((field) => {
    if (req.body[field] !== undefined) tag[field] = req.body[field];
  });

  await tag.save();

  // Response
  return sendResponse(res, 200, true, tag, null, "Update Tag successfully");
});

tagController.deleteSingleTag = catchAsync(async (req, res, next) => {
  // Get data from requests
  const tagId = req.params.tagId;

  // Business logic validation
  // Process
  const tag = await Tag.findByIdAndDelete(tagId);

  // delete tag should remove all the tag in all tasks that contain this tag
  await Task.updateMany(
    { tags: tagId },
    { $pull: { tags: tagId } },
    { multi: true }
  );
  // Response
  return sendResponse(res, 200, true, null, null, "Delete Tag successfully");
});

module.exports = tagController;
