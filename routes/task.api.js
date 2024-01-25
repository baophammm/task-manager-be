const express = require("express");
const router = express.Router();

/**
 * @route POST /tasks
 * @description create a task
 * @body {title, description, assignee, project, startAt, dueAt, files}
 * @access login required - project owner, project manager for projects. Any user can create task for personal tasks.
 */

/**
 * @route GET /tasks
 * @description get a list of tasks with pagination
 * @access login required
 */

/**
 * @route PUT /tasks/:id
 * @description edit fields of tasks
 * @body { title, description, assignee, project, taskStatus: "Backlog" or "Pending" or "InProgress" or "Completed" or "Reviewed" or "Archived", priority: "Critical" or "High" or "Medium" or "Low", startAt, dueAt, files }
 * @access login required - project owner, project manager for projects, normal project member can only update taskStatus. Any user can edit personal tasks.
 */

/**
 * @route DELETE /tasks/:id
 * @description delete a task
 * @access login required - same as edit task
 */

/**
 * @route GET /tasks/:id
 * @description get detail of a task
 * @access login required
 */

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
