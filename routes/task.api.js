const express = require("express");
const taskController = require("../controllers/task.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { body, param, query } = require("express-validator");
const router = express.Router();

/**
 * @route POST /tasks
 * @description create a task
 * @body {title, description, taskStatus, assigneeId, projectId, startAt, dueAt}
 * @access login required - project owner, project Lead for projects. Any user can create task for personal tasks.
 */
router.post(
  "/",
  authentication.loginRequired,
  validators.validate([
    body("title", "Invalid Title").exists().notEmpty(),
    body("taskStatus, Reminder: Case sensitivity")
      .optional()
      .isString()
      .isIn(["Backlog", "InProgress", "Completed", "Archived"]),

    body("projectId")
      .optional({ nullable: true, values: "falsy" })
      .isString()
      .custom(validators.checkObjectId),
    body("assigneeId")
      .optional({ nullable: true, values: "falsy" })
      .isString()
      .custom(validators.checkObjectId),
    body("startAt", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
    body("dueAt", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
  ]),
  taskController.createNewTask
);

/**
 * @route GET /tasks
 * @description get a list of current user's tasks with pagination
 * @query {search, taskStatus,  assigneeId, projectId, startBefore, startAfter, dueBefore, dueAfter}
 * @access login required
 */
router.get(
  "/",
  authentication.loginRequired,
  validators.validate([
    query("taskStatus", "Invalid taskStatus. Reminder: Case sensitivity")
      .optional()
      .isString()
      .isIn(["Backlog", "InProgress", "Completed", "Archived"]),

    query("assigneeId")
      .optional({ nullable: true, values: "falsy" })
      .isString()
      .custom(validators.checkObjectId),
    query("projectId")
      .optional({ nullable: true, values: "falsy" })
      .isString()
      .custom(validators.checkObjectId),
    query("startAfter", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
    query("startBefore", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
    query("dueBefore", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
    query("dueAfter", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
  ]),
  taskController.getTasks
);

/**
 * @route GET /tasks/:id
 * @description get my single task detail
 * @access login required
 */
router.get(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  taskController.getSingleTask
);

/**
 * @route PUT /tasks/:id
 * @description edit fields of tasks
 * @body { title, description, assigneeId, projectId, taskStatus: "Backlog" or "Pending" or "InProgress" or "Completed" or "Reviewed" or "Archived", startAt, dueAt, files }
 * @access login required - project owner, project Lead for projects, normal project member can only update taskStatus. Any user can edit personal tasks.
 */
router.put(
  "/:taskId",
  authentication.loginRequired,
  validators.validate([
    param("taskId").exists().isString().custom(validators.checkObjectId),
    body("taskStatus", "Invalid taskStatus. Reminder: Case sensitivity")
      .optional()
      .isString()
      .isIn(["Backlog", "InProgress", "Completed", "Archived"]),

    body("assigneeId")
      .optional({ nullable: true, values: "falsy" })
      .isString()
      .custom(validators.checkObjectId),
    body("projectId")
      .optional({ nullable: true, values: "falsy" })
      .isString()
      .custom(validators.checkObjectId),
    body("startAt", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
    body("dueAt", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
  ]),
  taskController.updateSingleTask
);

/**
 * @route DELETE /tasks/:id
 * @description delete a task
 * @access login required - same as edit task
 */
router.delete(
  "/:taskId",
  authentication.loginRequired,
  validators.validate([
    param("taskId").exists().isString().custom(validators.checkObjectId),
  ]),
  taskController.deleteSingleTask
);

/**
 * @route GET /tasks/:id/comments
 * @description get a list of comments in a task with pagination
 * @access login required
 */
router.get(
  "/:taskId/comments",
  authentication.loginRequired,
  validators.validate([
    param("taskId").exists().isString().custom(validators.checkObjectId),
  ]),
  taskController.getCommentsOfTask
);

/**
 * @route POST /tasks/:id/subtasks
 * @description create a subtask in a task
 * @body { subTaskText }
 * @access login required
 */
router.post(
  "/:taskId/subtasks",
  authentication.loginRequired,
  validators.validate([
    param("taskId").exists().isString().custom(validators.checkObjectId),
    body("subTaskText", "Invalid SubTask Text").exists().notEmpty(),
  ]),
  taskController.createNewSubTaskOfSingleTask
);

/**
 * @route GET /tasks/:id/subtasks
 * @description get a list of subtasks in a task
 * @access login required
 */
router.get(
  "/:taskId/subtasks",
  authentication.loginRequired,
  validators.validate([
    param("taskId").exists().isString().custom(validators.checkObjectId),
  ]),
  taskController.getSubTasksOfSingleTask
);

/**
 * @route PUT /tasks/:taskId/subtasks/:subTaskId
 * @description check or uncheck subtask
 * @body { isChecked }
 * @access login required
 */
router.put(
  "/:taskId/subtasks/:subTaskId",
  authentication.loginRequired,
  validators.validate([
    param("taskId").exists().isString().custom(validators.checkObjectId),
    param("subTaskId").exists().isString().custom(validators.checkObjectId),
    body("isChecked", "Invalid isChecked").exists().isBoolean(),
  ]),
  taskController.updateSubTaskIsChecked
);

/**
 * @route DELETE /tasks/:taskId/subtasks/:subTaskId
 * @description delete a subtask
 * @access login required
 */
router.delete(
  "/:taskId/subtasks/:subTaskId",
  authentication.loginRequired,
  validators.validate([
    param("taskId").exists().isString().custom(validators.checkObjectId),
    param("subTaskId").exists().isString().custom(validators.checkObjectId),
  ]),
  taskController.deleteSubTaskOfSingleTask
);

module.exports = router;
