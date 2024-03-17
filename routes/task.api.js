const express = require("express");
const taskController = require("../controllers/task.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { body, param, query } = require("express-validator");
const router = express.Router();

/**
 * @route POST /tasks
 * @description create a task
 * @body {title, description, taskStatus, taskPriority, assigneeId, projectId, startAt, dueAt}
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
    body("priority", "Invalid priority. Reminder: Case sensitivity")
      .optional()
      .isString()
      .isIn(["Critical", "High", "Medium", "Low"]),

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
 * @query {search, taskStatus, priority, assigneeId, projectId, startBefore, startAfter, dueBefore, dueAfter}
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
    query("priority", "Invalid priority. Reminder: Case sensitivity")
      .optional()
      .isString()
      .isIn(["Critical", "High", "Medium", "Low"]),
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
 * @body { title, description, assigneeId, projectId, taskStatus: "Backlog" or "Pending" or "InProgress" or "Completed" or "Reviewed" or "Archived", priority: "Critical" or "High" or "Medium" or "Low", startAt, dueAt, files }
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
    body("priority", "Invalid priority. Reminder: Case sensitivity")
      .optional()
      .isString()
      .isIn(["Critical", "High", "Medium", "Low"]),
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
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
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
 * @route GET /tasks/:id/notifications
 * @description get a list of notification of a tasks with pagination
 * @access login required
 */

/**
 * @route GET /tasks/:id/notifications/:id
 * @description get info of a notification with notification Id
 * @access login required
 */

module.exports = router;
