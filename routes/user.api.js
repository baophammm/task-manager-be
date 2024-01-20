const express = require("express");
const router = express.Router();

/**
 * @route POST /users
 * @description Create new account
 * @body { firstName, lastName, email, password }
 * @access Public
 */

/**
 * @route GET /users
 * @description Get users with pagination
 * @access login required
 */

/**
 * @route GET /users/:id
 * @description Get a single user info
 * @access login required
 */

/**
 * @route GET /users/me
 * @description Get the current user info
 * @access login required
 */

/**
 * @route PUT /users/:id
 * @description Update user profile
 * @body {firstName, lastName, password}
 * @access login required
 */

/**
 * @route DELETE /users/:id
 * @description Delete a user profile
 * @access login required
 */

/**
 * @route GET /users/:id/tasks
 * @description get a list of tasks of a user
 * @access login required
 */

/**
 * @route GET /users/me/tasks
 * @description get a list of tasks of current user
 * @access login required
 */

/**
 * @route GET /users/me/invitations
 * @description get a list of my sent invitations
 * @access login required - project owner
 */

/**
 * @route GET /users/me/notifications
 * @description get a list of my notifications with pagination
 * @access login required
 */

module.exports = router;
