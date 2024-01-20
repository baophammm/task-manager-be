const express = require("express");
const router = express.Router();

/**
 * @route POST /notifications/reminders
 * @description create a reminder notification for current user
 * @body { title, message, targetType, targetID, sendTime}
 * @access login required
 */

/**
 * @route GET /notifications/reminders
 * @description get my list of my reminders with pagination
 * @access login required
 */

/**
 * @route PUT /notifications/reminders/:id
 * @description edit my reminder
 * @body { title, message, sendTime}
 * @access login required
 */

/**
 * @route DELETE /notifications/reminders/:id
 * @description delete my reminder
 * @access login required
 */

module.exports = router;
