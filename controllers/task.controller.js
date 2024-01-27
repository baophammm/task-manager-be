const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const Task = require("../models/Task");
const User = require("../models/User");
const Project = require("../models/Project");
const {
  Types: { ObjectId },
} = require("mongoose");

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

      if (
        !project.projectMembers.includes(assigneeId) &&
        !project.projectOwner.equals(assigneeId)
      )
        throw new AppError(
          400,
          "Assignee Not A Member of Selected Project",
          "Create New Task Error"
        );
    }
  }

  if (!projectId && assigneeId)
    throw new AppError(
      401,
      "Cannot Select Assignee Without Project",
      "Create New Task Error"
    );

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
  const currentUserId = req.userId;
  let { page, limit, ...filter } = { ...req.query };

  // Business logic validation
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  // check filter input
  const allows = [
    "search",
    "taskStatus",
    "priority",
    "assigneeId",
    "projectId",
    "startAfter",
    "startBefore",
    "dueAfter",
    "dueBefore",
  ];

  const filterKeys = Object.keys(filter);

  filterKeys.map((key) => {
    if (!allows.includes(key))
      throw new AppError(
        400,
        `Key ${key} is not allowed. Reminder: Case sensitivity`,
        "Get List of Projects Error"
      );
  });
  // Process
  // only allow to see personal tasks or tasks within projects that current user is in
  const projects = await Project.find({
    isDeleted: false,
    $or: [{ projectOwner: currentUserId }, { projectMembers: currentUserId }],
  });

  const projectIds = projects.map((project) => project._id);

  const filterConditions = [
    {
      isDeleted: false,
    },
    {
      $or: [{ assigneeId: currentUserId }, { projectId: { $in: projectIds } }],
    }, // tasks assigned to current user or other members in his/her projects
  ];

  // query filters
  filterKeys.forEach((field) => {
    if (filter[field]) {
      const condition = (() => {
        switch (field) {
          case "search":
            return {
              $or: [
                { title: { $regex: filter[field], $options: "i" } },
                { description: { $regex: filter[field], $options: "i" } },
              ],
            };
          case "startAfter":
            return { startAt: { $gte: filter[field] } };
          case "startBefore":
            return { startAt: { $lte: filter[field] } };
          case "dueAfter":
            return { dueAt: { $gte: filter[field] } };
          case "dueBefore":
            return { dueAt: { $lte: filter[field] } };
          default:
            return { [field]: filter[field] };
        }
      })();
      filterConditions.push(condition);
    }
  });

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await Task.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let tasks = await Task.find(filterCriteria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  // Response
  return sendResponse(
    res,
    200,
    { tasks, totalPages, count },
    null,
    "Get List of Tasks successfully "
  );
});

taskController.getSingleTask = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  const taskId = req.params.id;

  // Business logic validation
  // only allow to see personal task or task within projects that current user is in
  const projects = await Project.find({
    isDeleted: false,
    $or: [{ projectOwner: currentUserId }, { projectMembers: currentUserId }],
  });

  const projectIds = projects.map((project) => project._id);

  const task = await Task.findOne({
    _id: taskId,
    isDeleted: false,
    $or: [
      {
        assigneeId: currentUserId,
      },
      { projectId: { $in: projectIds } },
    ], //only tasks assigned to current user or within his/her projects
  });

  if (!task)
    throw new AppError(
      401,
      "Task Not Found or Unauthorized to see Task",
      "Get Single Task Error"
    );
  // Process
  // Response
  return sendResponse(
    res,
    200,
    true,
    task,
    null,
    "Get Single Task successfully"
  );
});

taskController.updateSingleTask = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  const taskId = req.params.id;

  // Business logic validation
  // only allow to edit task that is personal or if I am project Owner or Manager.
  const projects = await Project.find({
    isDeleted: false,
    $or: [{ projectOwner: currentUserId }, { projectManagers: currentUserId }],
  });
  // project Ids that current user is the owner or manager
  const projectIds = projects.map((project) => project._id);

  let task = await Task.findOne({
    _id: taskId,
    isDeleted: false,
    $or: [
      { projectId: null, createdBy: currentUserId, assigneeId: currentUserId }, //personal task without project
      { projectId: { $in: projectIds } }, //tasks within projects that current user is owner or manager
    ],
  });

  if (!task)
    throw new AppError(
      401,
      "Task Not Found or Unauthorized to Edit Task",
      "Update Single Task Error"
    );

  if (req.body.startAt && req.body.dueAt) {
    if (req.body.dueAt < req.body.startAt)
      throw new AppError(
        400,
        "Due date cannot be before start date",
        "Update Current User Single Task Error"
      );
  }

  const previousAssigneeId = task.assigneeId;
  const previousProjectId = task.projectId;
  const newAssigneeId = req.body.assigneeId;
  const newProjectId = req.body.projectId;

  // If task already in project, cannot change project id
  if (previousProjectId && newProjectId) {
    if (!previousProjectId.equals(newProjectId))
      throw new AppError(
        400,
        "Cannot Change Task Project",
        "Update Single Task Error"
      );
  }

  // If task not in project and add to new project => Check if new project in project Ids list of owner or manager
  if (!previousProjectId && newProjectId) {
    // ERROR TO CHECK project id list cannot include newProjectId
    // const mongoProjectId = new ObjectId(newProjectId);
    // console.log("PROJECT ID LIST TO CHECK", projectIds);
    // console.log("NEW PROJECT ID", mongoProjectId);
    // console.log("CHECK IF equals", projectIds[0].equals(newProjectId));
    // console.log("CHECK IF INCLUDES", projectIds.includes(newProjectId));

    let isProjectAllowed = false;
    projectIds.forEach((projectId) => {
      if (projectId.equals(newProjectId)) {
        isProjectAllowed = true;
      }
    });

    if (!isProjectAllowed)
      throw new AppError(
        401,
        "Unauthorized to Add Task to selected Project",
        "Update Single Task Error"
      );

    // if (!projectIds.includes(mongoProjectId)) {
    // throw new AppError(
    //   401,
    //   "Unauthorized to Add Task to selected Project",
    //   "Update Single Task Error"
    // );
    // }
  }

  // If project, check assignee assign authorization

  // Process

  const allows = [
    "title",
    "description",
    "assigneeId",
    "projectId",
    "taskStatus",
    "priority",
    "startAt",
    "dueAt",
    "files",
  ];

  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field];
    }
  });

  await task.save();
  // Update task count of user and project
  // Response
  return sendResponse(
    res,
    200,
    true,
    task,
    null,
    "Update Current User Single Task successfully"
  );
});

taskController.deleteSingleTask = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  const taskId = req.params.id;

  // Business logic validation
  // only allow to delete task that is personal or if I am project Owner or Manager.
  const projects = await Project.find({
    isDeleted: false,
    $or: [{ projectOwner: currentUserId }, { projectManagers: currentUserId }],
  });
  // project Ids that current user is the owner or manager
  const projectIds = projects.map((project) => project._id);

  let task = await Task.findOne({
    _id: taskId,
    isDeleted: false,
    $or: [
      { projectId: null, createdBy: currentUserId, assigneeId: currentUserId }, //personal task without project
      { projectId: { $in: projectIds } }, //tasks within projects that current user is owner or manager
    ],
  });

  if (!task)
    throw new AppError(
      401,
      "Task Not Found or Unauthorized to Delete Task",
      "Delete Single Task Error"
    );
  // Process
  task.isDeleted = true; // soft delete task
  await task.save();
  await taskController.calculateUserTaskCount(currentUserId);
  if (task.projectId) {
    await taskController.calculateProjectTaskCount(task.projectId);
  }
  // Response
  return sendResponse(
    res,
    200,
    true,
    task,
    null,
    "Delete Single Task successfully"
  );
});

module.exports = taskController;
