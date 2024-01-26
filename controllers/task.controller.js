const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const Task = require("../models/Task");
const User = require("../models/User");
const Project = require("../models/Project");

const taskController = {};

taskController.calculateUserTaskCount = async (userId) => {
  try {
    const taskCount = await Task.countDocuments({
      assigneeId: userId,
      isDeleted: false,
    });

    await User.findByIdAndUpdate(userId, { taskCount });
  } catch (error) {
    throw new Error("Calculate User Task Count Error");
  }
};

taskController.calculateProjectTaskCount = async (projectId) => {
  try {
    const taskCount = await Task.countDocuments({
      projectId,
      isDeleted: false,
    });

    await Project.findByIdAndUpdate(projectId, { taskCount });
  } catch (error) {
    throw new Error("Calculate Project Task Count Error");
  }
};
taskController.createNewTask = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  let {
    title,
    description,
    taskStatus,
    priority,
    projectId,
    assigneeId,
    startAt,
    dueAt,
    files,
  } = req.body;

  // Business logic validation
  // if project, can only set if your are project owner or manager

  if (projectId) {
    let project = await Project.findOne({
      _id: projectId,
      isDeleted: false,
      $or: [
        { projectOwner: currentUserId },
        { projectManagers: currentUserId },
      ],
    });

    if (!project)
      throw new AppError(
        401,
        "Cannot find project or Unauthorized to set task to this project",
        "Create New Task Error"
      );

    // check if assignee exists or is in the project
    if (assigneeId) {
      let assignee = await User.findOne({
        _id: assigneeId,
        isDeleted: false,
      });

      if (!assignee)
        throw new AppError(400, "Assignee not found", "Create New Task Error");

      if (!project.projectMembers.includes(assigneeId))
        throw new AppError(
          400,
          "Assignee Not A Member of Selected Project",
          "Create New Task Error"
        );
    }
  }

  if (startAt && dueAt) {
    if (dueAt < startAt)
      throw new AppError(
        400,
        "dueAt cannot be before startAt",
        "Create New Task Error"
      );
  }
  // Process
  assigneeId = assigneeId || currentUserId;

  let task = await Task.create({
    title,
    description,
    taskStatus,
    priority,
    projectId,
    assigneeId,
    startAt,
    dueAt,
    files,
    createdBy: currentUserId,
  });

  await taskController.calculateUserTaskCount(assigneeId);
  if (projectId) {
    await taskController.calculateProjectTaskCount(projectId);
  }
  // Response
  return sendResponse(
    res,
    200,
    true,
    task,
    null,
    "Create New Task successfully"
  );
});

taskController.getTasks = catchAsync(async (req, res, next) => {
  // Get data from requests
  // Business logic validation
  // Process
  // Response
  res.send("GETTING LIST OF TASKS");
});
taskController.getSingleTask = catchAsync(async (req, res, next) => {
  // Get data from requests
  // Business logic validation
  // Process
  // Response
  res.send("GETTING A SINGLE TASK");
});
taskController.updateSingleTask = catchAsync(async (req, res, next) => {
  // Get data from requests
  // Business logic validation
  // Process
  // Response
  res.send("UPDATING A SINGLE TASK");
});
taskController.deleteSingleTask = catchAsync(async (req, res, next) => {
  // Get data from requests
  // Business logic validation
  // Process
  // Response
  res.send("DELETING A SINGLE TASK");
});

module.exports = taskController;
