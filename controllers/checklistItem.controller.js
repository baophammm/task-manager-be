const { check } = require("express-validator");
const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const Checklist = require("../models/Checklist");
const ChecklistItem = require("../models/ChecklistItem");
const Project = require("../models/Project");
const Task = require("../models/Task");

const checklistItemController = {};

checklistItemController.calculateChecklistChecklistItemCount = async (
  checklistId
) => {
  try {
    const itemCount = await ChecklistItem.countDocuments({
      checklist: checklistId,
    });

    await Checklist.findByIdAndUpdate(checklistId, { itemCount });
  } catch (error) {
    throw new Error("Calculate Checklist ChecklistItem Count Error");
  }
};

checklistItemController.updateSingleChecklistItem = catchAsync(
  async (req, res, next) => {
    // Get data from requests
    const currentUserId = req.userId;
    const checklistItemId = req.params.checklistItemId;

    // Business logic validation
    const checklistItem = await ChecklistItem.findById(checklistItemId);

    if (!checklistItem)
      throw new AppError(
        400,
        "ChecklistItem not found",
        "Update ChecklistItem Error"
      );

    const checklistId = checklistItem.checklist;
    const checklist = await Checklist.findById(checklistId);

    if (!checklist)
      throw new AppError(
        400,
        "Checklist not found",
        "Update ChecklistItem Error"
      );

    const taskId = checklist.task;

    // only allow to update checklistItem of tasks that current user is lead or owner of project OR task is personal
    const projects = await Project.find({
      isDeleted: false,
      $or: [{ projectOwner: currentUserId }, { projectLeads: currentUserId }],
    });

    const projectIds = projects.map((project) => project._id);

    let task = await Task.findOne({
      _id: taskId,
      isDeleted: false,
      $or: [
        { project: null, createdBy: currentUserId, assignee: currentUserId }, //personal task without project
        { project: { $in: projectIds } }, //tasks within projects that current user is project owner or lead
      ],
    });

    if (!task)
      throw new AppError(
        400,
        "Task not found or unauthorized to update checklistItem",
        "Update ChecklistItem Error"
      );

    // Process
    const allows = ["isChecked", "itemTitle"];
    allows.forEach((field) => {
      if (req.body[field] !== undefined) checklistItem[field] = req.body[field];
    });
    await checklistItem.save();

    // Response
    return sendResponse(
      res,
      200,
      true,
      checklistItem,
      null,
      "Update ChecklistItem successfully"
    );
  }
);

checklistItemController.deleteSingleChecklistItem = catchAsync(
  async (req, res, next) => {
    // Get data from requests
    const currentUserId = req.userId;
    const checklistItemId = req.params.checklistItemId;

    // Business logic validation
    let checklistItem = await ChecklistItem.findById(checklistItemId);

    if (!checklistItem)
      throw new AppError(
        400,
        "ChecklistItem not found",
        "Delete ChecklistItem Error"
      );

    const checklistId = checklistItem.checklist;
    const checklist = await Checklist.findById(checklistId);

    if (!checklist)
      throw new AppError(
        400,
        "Checklist not found",
        "Update ChecklistItem Error"
      );

    const taskId = checklist.task;

    // only allow to delete checklistItem of tasks that current user is lead or owner of project OR task is personal
    const projects = await Project.find({
      isDeleted: false,
      $or: [{ projectOwner: currentUserId }, { projectLeads: currentUserId }],
    });

    const projectIds = projects.map((project) => project._id);

    let task = await Task.findOne({
      _id: taskId,
      isDeleted: false,
      $or: [
        { project: null, createdBy: currentUserId, assignee: currentUserId }, //personal task without project
        { project: { $in: projectIds } }, //tasks within projects that current user is project owner or lead
      ],
    });

    if (!task)
      throw new AppError(
        400,
        "Task not found or unauthorized to delete checklistItem",
        "Delete Checklist Item Error"
      );

    // Process
    checklistItem = await ChecklistItem.findByIdAndDelete(checklistItemId);

    await checklistItemController.calculateChecklistChecklistItemCount(
      checklistId
    );

    // Response
    return sendResponse(
      res,
      200,
      true,
      checklistItem,
      null,
      "Delete Checklist Item successfully"
    );
  }
);
module.exports = checklistItemController;
