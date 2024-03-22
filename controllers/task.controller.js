const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const Task = require("../models/Task");
const User = require("../models/User");
const Project = require("../models/Project");
const Comment = require("../models/Comment");
const { createNewMongoNotification } = require("./notification.controller");
const {
  Types: { ObjectId },
} = require("mongoose");
const Notification = require("../models/Notification");

const taskController = {};

taskController.calculateUserTaskCount = async (userId) => {
  try {
    const taskCount = await Task.countDocuments({
      assignee: userId,
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
      project: projectId,
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
    projectId,
    assigneeId,
    startAt,
    dueAt,
  } = req.body;

  // Business logic validation
  // if project, can only set if your are project owner or Lead

  if (projectId) {
    let targetProject = await Project.findOne({
      _id: projectId,
      isDeleted: false,
      $or: [{ projectOwner: currentUserId }, { projectLeads: currentUserId }],
    });

    if (!targetProject)
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
        !targetProject.projectMembers.includes(assigneeId) &&
        !targetProject.projectOwner.equals(assigneeId)
      )
        throw new AppError(
          400,
          "Assignee Not A Member of Selected Project",
          "Create New Task Error"
        );
    }

    // if task and project have start and due date, limit task time period within project's time period
    if (dueAt && targetProject.dueAt) {
      if (new Date(dueAt) > new Date(targetProject.dueAt))
        throw new AppError(
          400,
          "Task Due date cannot be after Project Due date",
          "Create New Task Error"
        );
    }

    if (startAt && targetProject.startAt) {
      if (new Date(startAt) < new Date(targetProject.startAt))
        throw new AppError(
          400,
          "Task Start date cannot be before Project Start date",
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
    project: projectId,
    assignee: assigneeId,
    startAt,
    dueAt,
    createdBy: currentUserId,
  });

  await taskController.calculateUserTaskCount(assigneeId);
  if (projectId) {
    await taskController.calculateProjectTaskCount(projectId);
  }

  task = await Task.findById(task._id).populate(["project", "assignee"]);

  // send notification
  if (projectId) {
    let project = await Project.findById(projectId);

    if (assigneeId !== currentUserId) {
      await createNewMongoNotification({
        title: "New Task Assigned",
        message: `Task ${title} has been assigned to you in project ${project.title}`,
        to: assigneeId,
        sendTime: new Date(),
        targetType: "Task",
        targetId: task._id,
        type: "System",
      });
    }
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
      $or: [{ assignee: currentUserId }, { project: { $in: projectIds } }],
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
          case "projectId":
            return {
              project: filter[field],
            };
          case "assigneeId":
            return {
              assignee: filter[field],
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
    .limit(limit)
    .populate(["project", "assignee"]);

  // Response
  return sendResponse(
    res,
    200,
    true,
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
        assignee: currentUserId,
      },
      { project: { $in: projectIds } },
    ], //only tasks assigned to current user or within his/her projects
  }).populate(["project", "assignee"]);

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
  const taskId = req.params.taskId;

  // Business logic validation
  // only allow to edit task that is personal or if I am project Owner or Lead.
  const projects = await Project.find({
    isDeleted: false,
    $or: [{ projectOwner: currentUserId }, { projectLeads: currentUserId }],
  });
  // project Ids that current user is the owner or Lead
  const projectIds = projects.map((project) => project._id);

  let task = await Task.findOne({
    _id: taskId,
    isDeleted: false,
    $or: [
      { project: null, createdBy: currentUserId, assignee: currentUserId }, //personal task without project
      { project: { $in: projectIds } }, //tasks within projects that current user is owner or Lead
    ],
  });

  if (!task)
    throw new AppError(
      401,
      "Task Not Found or Unauthorized to Edit Task",
      "Update Single Task Error"
    );

  const taskOriginalTitle = task ? task.title : null;
  if (req.body.startAt && req.body.dueAt) {
    if (req.body.dueAt < req.body.startAt)
      throw new AppError(
        400,
        "Due date cannot be before start date",
        "Update Current User Single Task Error"
      );
  }

  const previousAssigneeId = task.assignee;
  const previousProjectId = task.project;
  const previousStartAt = task.startAt;
  const previousDueAt = task.dueAt;

  const newAssigneeId = req.body.assigneeId;
  const newProjectId = req.body.projectId;
  const newStartAt = req.body.startAt || null;
  const newDueAt = req.body.dueAt || null;

  // If task already in project, cannot change project id
  if (previousProjectId && newProjectId) {
    if (!previousProjectId.equals(newProjectId))
      throw new AppError(
        400,
        "Cannot Change Task Project",
        "Update Single Task Error"
      );
  }

  // If task not in project and add to new project => Check if new project in project Ids list of owner or Lead

  if (!previousProjectId && newProjectId) {
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
  }

  // // Check assignee authorization
  // if (!previousProjectId && !newProjectId && newAssigneeId) {
  //   if (newAssigneeId !== currentUserId)
  //     throw new AppError(
  //       401,
  //       "Unauthorized to Assign current Task to targeted Assignee",
  //       "Update Single Task Error"
  //     );
  // }
  // check assignee assign authorization
  if (newAssigneeId) {
    let taskProjectId = newProjectId ? newProjectId : previousProjectId;
    let isProjectAllowed = false;

    if (taskProjectId) {
      projectIds.forEach((projectId) => {
        if (projectId.equals(taskProjectId)) {
          isProjectAllowed = true;
        }
      });
    }
    if (newAssigneeId !== currentUserId) {
      if (!taskProjectId || !isProjectAllowed)
        throw new AppError(
          401,
          "Unauthorized to set Assignee for this Task",
          "Update Single Task Error"
        );
    }
  }

  // check start date and due date of task vs project
  let finalProjectId =
    newProjectId && !previousProjectId
      ? newProjectId
      : previousProjectId
      ? previousProjectId
      : null;

  let finalStartAt = newStartAt
    ? newStartAt
    : previousStartAt
    ? previousStartAt
    : null;

  let finalDueAt = newDueAt ? newDueAt : previousDueAt ? previousDueAt : null;

  let project;
  if (finalProjectId) {
    project = await Project.findOne({
      _id: finalProjectId,
      isDeleted: false,
    });
  }

  if (finalDueAt && project && project.dueAt) {
    if (new Date(finalDueAt) > new Date(project.dueAt)) {
      throw new AppError(
        400,
        "Task Due date cannot be after Project Due date",
        "Update Single Task Error"
      );
    }
  }
  if (finalStartAt && project && project.startAt) {
    if (new Date(finalStartAt) < new Date(project.startAt)) {
      throw new AppError(
        400,
        "Task Start date cannot be before Project Start date",
        "Update Single Task Error"
      );
    }
  }

  // Process

  const allows = [
    "title",
    "description",
    "assigneeId",
    "projectId",
    "taskStatus",

    "startAt",
    "dueAt",
    "files",
  ];

  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === "assigneeId") {
        if (req.body[field] === null && !task.project) {
          task.assignee = currentUserId;
        } else {
          task.assignee = req.body[field];
        }
      } else if (field === "projectId") {
        task.project = req.body[field];
      } else {
        task[field] = req.body[field];
      }
    }
  });

  await task.save();
  task = await Task.findById(taskId).populate(["project", "assignee"]);

  // Update task count of user and project
  if (newProjectId && !previousProjectId) {
    await taskController.calculateProjectTaskCount(newProjectId);
  }

  if (newAssigneeId) {
    await taskController.calculateUserTaskCount(newAssigneeId);
    await taskController.calculateUserTaskCount(previousAssigneeId);
  }

  // send notification

  const finalAssigneeId = newAssigneeId ? newAssigneeId : previousAssigneeId;

  if (finalAssigneeId.toString() !== currentUserId) {
    await createNewMongoNotification({
      title: "Task Update",
      message: newAssigneeId
        ? `Task ${taskOriginalTitle} of project ${task.project.title} has been updated and assigned to you`
        : `Task ${taskOriginalTitle} of project ${task.project.title} has been updated`,
      to: finalAssigneeId,
      sendTime: new Date(),
      targetType: "Task",
      targetId: taskId,
      type: "System",
    });
  }

  if (newAssigneeId) {
    if (!previousAssigneeId.equals(currentUserId)) {
      await createNewMongoNotification({
        title: "Task Update",
        message: `You are unassigned from task ${taskOriginalTitle} of project ${task.project.title}`,
        to: previousAssigneeId,
        sendTime: new Date(),
        targetType: "Task",
        targetId: taskId,
        type: "System",
      });
    }
  }

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
  const taskId = req.params.taskId;

  // Business logic validation
  // only allow to delete task that is personal or if I am project Owner or Lead.
  const projects = await Project.find({
    isDeleted: false,
    $or: [{ projectOwner: currentUserId }, { projectLeads: currentUserId }],
  });
  // project Ids that current user is the owner or Lead
  const projectIds = projects.map((project) => project._id);

  let task = await Task.findOne({
    _id: taskId,
    isDeleted: false,
    $or: [
      { project: null, createdBy: currentUserId, assignee: currentUserId }, //personal task without project
      { project: { $in: projectIds } }, //tasks within projects that current user is owner or lead
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
  if (task.project) {
    await taskController.calculateProjectTaskCount(task.project);
  }

  // send notification
  if (task.project) {
    task = await Task.findById(taskId).populate("project");
    if (!task.assignee.equals(currentUserId)) {
      await createNewMongoNotification({
        title: "Task Deleted",
        message: `Task ${task.title} of project ${task.project.title} has been deleted`,
        to: task.assignee,
        sendTime: new Date(),
        targetType: "Project",
        targetId: task.project._id,
        type: "System",
      });
    }
    // change previous notifications related to task to Project
    const projectId = task.project._id;
    await Notification.deleteMany({
      targetType: "Task",
      targetId: taskId,
      isRead: true,
    });

    let notifications = await Notification.updateMany(
      {
        targetType: "Task",
        targetId: taskId,
        isRead: false,
      },
      {
        message: "Task has been recently deleted",
        targetType: "Project",
        targetId: projectId,
      }
    );
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

taskController.getCommentsOfTask = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  const taskId = req.params.taskId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Business logic validation
  // only allow to see tasks in projects that current user is in
  const projects = await Project.find({
    isDeleted: false,
    projectMembers: currentUserId,
  });

  const projectIds = projects.map((project) => project._id);
  // find task
  const task = await Task.findOne({
    _id: taskId,
    isDeleted: false,
    $or: [
      { project: null, createdBy: currentUserId, assignee: currentUserId }, //personal task without project
      { project: { $in: projectIds } }, //tasks within projects that current user is in
    ],
  });

  if (!task)
    throw new AppError(
      400,
      "Task not found or unauthorized to view task",
      "Get Comments of Task Error"
    );

  // Process
  const count = await Comment.countDocuments({
    targetType: "Task",
    targetId: taskId,
  });
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const comments = await Comment.find({
    targetType: "Task",
    targetId: taskId,
  })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("author");

  // Response
  return sendResponse(
    res,
    200,
    true,
    { comments, totalPages, count },
    null,
    "Get comments of Task successfully"
  );
});

module.exports = taskController;
