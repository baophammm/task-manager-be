const express = require("express");
const router = express.Router();

/**
 * @route POST /projects
 * @description Create a project
 * @body {title, description, projectStatus, startAt, dueAt}
 * @access login required
 */

/**
 * @route GET /projects
 * @description Get a list of projects
 * @access login required
 */

/**
 * @route PUT /projects/:id
 * @description Update project
 * @access login required - project owner
 */

/**
 * @route DELETE /projects/:id
 * @description delete a project
 * @access login required - project owner
 */

/**
 * @route GET /projects/:id
 * @description get detail of a project
 * @access login required
 */

/**
 * @route GET /projects/:id/tasks
 * @description get a list of tasks of a project
 * @access login required
 */

/**
 * @route GET /projects/:id/comments
 * @description get a list of comments of a project with pagination
 * @access login required
 */

module.exports = router;
