const express = require("express");
const taskController = require("../controllers/task.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { body, param, query } = require("express-validator");
const router = express.Router();

/**
 * @route POST /tasks
 * @description create a task
 * @body {title, description, taskStatus, taskPriority, assigneeId, projectId, startAt, dueAt, files}
 * @access login required - project owner, project manager for projects. Any user can create task for personal tasks.
 */
router.post(
  "/",
  authentication.loginRequired,
  validators.validate([
    body("title", "Invalid Title").exists().notEmpty(),
    body("taskStatus")
      .optional()
      .isString()
      .isIn([
        "Backlog",
        "Pending",
        "InProgress",
        "WaitingForReview",
        "Reviewed",
        "Completed",
        "Archived",
      ]),
    body("priority")
      .optional()
      .isString()
      .isIn(["Critical", "High", "Medium", "Low"]),

    body("projectId").optional().isString().custom(validators.checkObjectId),
    body("assigneeId").optional().isString().custom(validators.checkObjectId),
    body("startAt", "Invalid Date Format").optional().isDate(),
    body("dueAt", "Invalid Date Format").optional().isDate(),
    body("files").optional().isArray().custom(validators.checkArrayOfString),
  ]),
  taskController.createNewTask
);

/**
 * @route GET /tasks
 * @description get a list of current user's tasks with pagination
 * @query {search, taskStatus, priority, project, startBefore, startAfter, dueBefore, dueAfter}
 * @access login required
 */
router.get("/", taskController.getTasks);

/**
 * @route GET /tasks/:id
 * @description get single task detail
 * @access login required
 */
router.get("/:id", taskController.getSingleTask);

/**
 * @route PUT /tasks/:id
 * @description edit fields of tasks
 * @body { title, description, assignee, project, taskStatus: "Backlog" or "Pending" or "InProgress" or "Completed" or "Reviewed" or "Archived", priority: "Critical" or "High" or "Medium" or "Low", startAt, dueAt, files }
 * @access login required - project owner, project manager for projects, normal project member can only update taskStatus. Any user can edit personal tasks.
 */
router.put("/:id", taskController.updateSingleTask);

/**
 * @route DELETE /tasks/:id
 * @description delete a task
 * @access login required - same as edit task
 */

router.delete("/:id", taskController.deleteSingleTask);
/**
 * @route GET /tasks/:id/comments
 * @description get a list of comments in a task with pagination
 * @access login required
 */

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
