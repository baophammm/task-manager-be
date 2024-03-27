const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const Checklist = require("../models/Checklist");
const ChecklistItem = require("../models/ChecklistItem");
const Project = require("../models/Project");
const Task = require("../models/Task");
const {
  calculateChecklistChecklistItemCount,
} = require("./checklistItem.controller");

const checklistController = {};

checklistController.calculateTaskChecklistCount = async (taskId) => {
  try {
    const checklistCount = await Checklist.countDocuments({
      task: taskId,
    });

    await Task.findByIdAndUpdate(taskId, { checklistCount });
  } catch (error) {
    throw new Error("Calculate Task Checklist Count Error");
  }
};

checklistController.updateSingleChecklist = catchAsync(
  async (req, res, next) => {
    // Get data from requests
    const currentUserId = req.userId;
    const checklistId = req.params.checklistId;
    const { checklistTitle } = req.body;
    // Business logic validation
    const checklist = await Checklist.findById(checklistId);

    if (!checklist)
      throw new AppError(400, "Checklist not found", "Update Checklist Error");

    const taskId = checklist.task;

    // only allow to update checklist of tasks that current user is lead or owner of project OR task is personal
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
        "Task not found or unauthorized to update checklist",
        "Update Checklist Error"
      );
    // Process
    const updatedChecklist = await Checklist.findByIdAndUpdate(
      checklistId,
      { checklistTitle },
      { new: true }
    );
    // Response
    return sendResponse(
      res,
      200,
      true,
      updatedChecklist,
      null,
      "Update Checklist successfully"
    );
  }
);

checklistController.deleteSingleChecklist = catchAsync(
  async (req, res, next) => {
    // Get data from requests
    const currentUserId = req.userId;
    const checklistId = req.params.checklistId;
    // Business logic validation
    const checklist = await Checklist.findById(checklistId);

    if (!checklist)
      throw new AppError(400, "Checklist not found", "Delete Checklist Error");

    const taskId = checklist.task;

    // only allow to delete checklist of tasks that current user is lead or owner of project OR task is personal
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
        "Task not found or unauthorized to delete checklist",
        "Delete Checklist Error"
      );
    // Process
    await Checklist.findByIdAndDelete(checklistId);

    // Delete checklist items of checklist
    await ChecklistItem.deleteMany({ checklist: checklistId });

    // Calculate task checklist count
    await checklistController.calculateTaskChecklistCount(taskId);
    // Response
    return sendResponse(
      res,
      200,
      true,
      null,
      null,
      "Delete Checklist successfully"
    );
  }
);

checklistController.createNewChecklistItemInChecklist = catchAsync(
  async (req, res, next) => {
    // Get data from requests
    const currentUserId = req.userId;
    const { checklistId } = req.params;
    const { itemTitle } = req.body;

    // Business logic validation
    const checklist = await Checklist.findById(checklistId);

    if (!checklist)
      throw new AppError(
        400,
        "Checklist not found",
        "Create Checklist Item Error"
      );

    const taskId = checklist.task;

    // only allow to create checklist item in checklist of tasks that current user is lead or owner of project OR task is personal
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
        "Task not found or unauthorized to create checklist item",
        "Create Checklist Item Error"
      );

    // Process
    const checklistItem = await ChecklistItem.create({
      checklist: checklistId,
      itemTitle,
    });

    // Calculate Checklist Item Count in Checklist
    await calculateChecklistChecklistItemCount(checklistId);

    // Response
    return sendResponse(
      res,
      201,
      true,
      checklistItem,
      null,
      "Create Checklist Item successfully"
    );
  }
);

checklistController.getChecklistItemsOfChecklist = catchAsync(
  async (req, res, next) => {
    // Get data from requests
    const currentUserId = req.userId;
    const { checklistId } = req.params;

    // Business logic validation
    const checklist = await Checklist.findById(checklistId);

    if (!checklist)
      throw new AppError(
        400,
        "Checklist not found",
        "Get Checklist Items Error"
      );

    const taskId = checklist.task;

    // only allow to get checklist items of checklist of tasks that current user is a member of project in
    const projects = await Project.find({
      isDeleted: false,
      projectMembers: currentUserId,
    });

    const projectIds = projects.map((project) => project._id);

    let task = await Task.findOne({
      _id: taskId,
      isDeleted: false,
      $or: [
        { project: null, createdBy: currentUserId, assignee: currentUserId }, //personal task without project
        { project: { $in: projectIds } }, //tasks within projects that current user is project member
      ],
    });

    if (!task)
      throw new AppError(
        400,
        "Task not found or unauthorized to get checklist items",
        "Get Checklist Items Error"
      );

    // Process
    const count = await ChecklistItem.countDocuments({
      checklist: checklistId,
    });
    const checklistItems = await ChecklistItem.find({ checklist: checklistId });

    // Response
    return sendResponse(
      res,
      200,
      true,
      { checklistItems, count },
      null,
      "Get Checklist Items successfully"
    );
  }
);
module.exports = checklistController;
