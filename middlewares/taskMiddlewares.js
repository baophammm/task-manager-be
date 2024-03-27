const Task = require("../models/Task");

const taskMiddlewares = {};

taskMiddlewares.checkTaskUpdateAccess = async (req, res, next) => {
  const currentUserId = req.userId;
  const task = await Task.findOne({
    _id: req.params.taskId,
    isDeleted: false,
    $or: [
      { project: null, createdBy: currentUserId, assignee: currentUserId },
      { project: { $in: projectIds } },
    ],
  });

  if (!task) {
    throw new AppError(
      400,
      "Task not found or unauthorized to update task",
      "Update Task Error"
    );
  }

  req.task = task;
  next();
};

module.exports = taskMiddlewares;
