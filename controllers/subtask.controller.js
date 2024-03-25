const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const Task = require("../models/Task");
const Project = require("../models/Project");
const SubTask = require("../models/SubTask");

const subtaskController = {};
subtaskController.updateSubTaskIsChecked = catchAsync(
  async (req, res, next) => {
    // Get data from requests
    const currentUserId = req.userId;
    const subTaskId = req.params.subTaskId;
    const { isChecked } = req.body;
    // Business logic validation
    const subTask = await SubTask.findById(subTaskId);

    if (!subTask)
      throw new AppError(
        400,
        "SubTask not found",
        "Update SubTask IsChecked Error"
      );

    const taskId = subTask.task;

    // only allow to update subtask of tasks that current user is lead or owner of project OR task is personal
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
        "Task not found or unauthorized to update subtask",
        "Update SubTask IsChecked Error"
      );

    // Process
    subTask.isChecked = isChecked;
    await subTask.save();

    // Response
    return sendResponse(
      res,
      200,
      true,
      subTask,
      null,
      "Update SubTask IsChecked successfully"
    );
  }
);

subtaskController.deleteSubTask = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  const subTaskId = req.params.subTaskId;
  // Business logic validation
  let subTask = await SubTask.findById(subTaskId);

  if (!subTask)
    throw new AppError(400, "SubTask not found", "Delete SubTask Error");

  const taskId = subTask.task;

  // only allow to delete subtask of tasks that current user is lead or owner of project OR task is personal
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
      "Task not found or unauthorized to delete subtask",
      "Delete SubTask Error"
    );
  // Process
  subTask = await SubTask.findByIdAndDelete(subTaskId);

  // Response
  return sendResponse(
    res,
    200,
    true,
    subTask,
    null,
    "Delete SubTask successfully"
  );
});

module.exports = subtaskController;
