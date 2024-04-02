const Task = require("../models/Task");
const Project = require("../models/Project");
const { AppError } = require("../helpers/utils");

const taskMiddlewares = {};

taskMiddlewares.checkTaskAccess = async (req, res, next) => {
  try {
    const currentUserId = req.userId;
    const taskId = req.params.taskId;

    const projects = await Project.find({
      isDeleted: false,
      projectMembers: currentUserId,
    });

    const projectIds = projects.map((project) => project._id);

    const task = await Task.findOne({
      _id: taskId,
      isDeleted: false,
      $or: [
        { project: null, createdBy: currentUserId, assignee: currentUserId }, //personal task without project
        { project: { $in: projectIds } }, // only allow to see personal task or task within projects that current user is in
      ],
    });

    if (!task) {
      throw new AppError(
        400,
        "Task not found or unauthorized to view task",
        "Task Error"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

taskMiddlewares.checkTaskUpdateAccess = async (req, res, next) => {
  try {
    const currentUserId = req.userId;

    const projects = await Project.find({
      isDeleted: false,
      $or: [{ projectOwner: currentUserId }, { projectLeads: currentUserId }],
    });

    const projectIds = projects.map((project) => project._id);

    const task = await Task.findOne({
      _id: req.params.taskId,
      isDeleted: false,
      $or: [
        { project: null, createdBy: currentUserId, assignee: currentUserId }, //personal task without project
        { project: { $in: projectIds } }, //tasks within projects that current user is owner or Lead
      ],
    });

    if (!task) {
      throw new AppError(
        400,
        "Task not found or unauthorized to update / delete task",
        "Update Task Error"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = taskMiddlewares;
