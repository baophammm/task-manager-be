const express = require("express");
const taskController = require("../controllers/task.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { body, param, query } = require("express-validator");
const taskMiddlewares = require("../middlewares/taskMiddlewares");
const router = express.Router();

/**
 * @route POST /tasks
 * @description create a task
 * @body {title, description, effort, taskStatus, assigneeId, projectId, startAt, dueAt}
 * @access login required - project owner, project Lead for projects. Any user can create task for personal tasks.
 */
router.post(
  "/",
  authentication.loginRequired,
  validators.validate([
    body("title", "Invalid Title").exists().notEmpty(),
    body("effort", "Invalid Effort")
      .optional({ nullable: true, values: "falsy" })
      .isNumeric()
      .custom(validators.checkNumberPositiveIntegerOrHalf),
    ,
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
 * @query {search, taskStatus, assigneeId, projectId, effortGreaterThan, effortLowerThan, startBefore, startAfter, dueBefore, dueAfter}
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
    query("effortGreaterThan", "Invalid Effort")
      .optional({ nullable: true, values: "falsy" })
      .isNumeric()
      .custom(validators.checkNumberPositiveIntegerOrHalf),
    ,
    query("effortLowerThan", "Invalid Effort")
      .optional({ nullable: true, values: "falsy" })
      .isNumeric()
      .custom(validators.checkNumberPositiveIntegerOrHalf),
    ,
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
 * @body { title, description, effort, assigneeId, projectId, taskStatus: "Backlog" or "Pending" or "InProgress" or "Completed" or "Reviewed" or "Archived", startAt, dueAt, files }
 * @access login required - project owner, project Lead for projects, normal project member can only update taskStatus. Any user can edit personal tasks.
 */
router.put(
  "/:taskId",
  authentication.loginRequired,
  validators.validate([
    param("taskId").exists().isString().custom(validators.checkObjectId),
    body("effort", "Invalid Effort")
      .optional({ nullable: true, values: "falsy" })
      .isNumeric()
      .custom(validators.checkNumberPositiveIntegerOrHalf),
    body("taskStatus", "Invalid taskStatus. Reminder: Case sensitivity")
      .optional({ nullable: true, values: "falsy" })
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
 * @route POST /tasks/:taskId/checklists
 * @description create a checklist in a task
 * @body { checklistTitle }
 * @access login required
 */

router.post(
  "/:taskId/checklists",
  authentication.loginRequired,
  validators.validate([
    param("taskId").exists().isString().custom(validators.checkObjectId),
    body("checklistTitle", "Invalid Checklist Title").exists().notEmpty(),
  ]),
  taskController.createNewChecklistOfSingleTask
);

/**
 * @route GET /tasks/:taskId/checklists
 * @description get a list of checklists in a task
 * @access login required
 */
router.get(
  "/:taskId/checklists",
  authentication.loginRequired,
  validators.validate([
    param("taskId").exists().isString().custom(validators.checkObjectId),
  ]),
  taskController.getChecklistsOfSingleTask
);
module.exports = router;
