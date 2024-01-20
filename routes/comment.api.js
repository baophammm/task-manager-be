const express = require("express");
const router = express.Router();

/**
 * @route POST /comments
 * @description Create a comment
 * @body { targetType: "Task" or "Project", targetID, content, files } // files only allow if targetType is Task
 * @access login required
 */

/**
 * @route PUT /comments/:id
 * @description Edit comment content
 * @body { content, files }
 * @access login required
 */

/**
 * @route DELETE /comments/:id
 * @description Delete a comment
 * @access login required
 */

/**
 * @route GET /comments/:id
 * @description Get detail of a comment
 * @access login required
 */

module.exports = router;
