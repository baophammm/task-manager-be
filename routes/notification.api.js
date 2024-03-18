const express = require("express");
const notificationController = require("../controllers/notification.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { body, query, param } = require("express-validator");
const router = express.Router();

/**
 * @route GET /notifications
 * @description get list of notifications to current User with pagination
 * @query {isRead: true or false, type: "System" or "User", targetType: "Project" or "Task"}
 * @access login required
 */
router.get(
  "/",
  authentication.loginRequired,
  validators.validate([
    query("isRead", "Invalid isRead")
      .optional({ nullable: true, values: "falsy" })
      .isBoolean(),
    query("type", "Invalid type. Reminder: Case sensitivity")
      .optional({ nullable: true, values: "falsy" })
      .isString()
      .isIn(["System", "User"]),
    query("targetType", "Invalid targetType. Reminder: Case sensitivity")
      .optional({ nullable: true, values: "falsy" })
      .isString()
      .isIn(["Project", "Task"]),
  ]),
  notificationController.getNotifications
);

/**
 * @route PUT /notifications/:notificationId
 * @description change notification details
 * @body {isRead}
 * @access login required
 */

router.put(
  "/:notificationId",
  authentication.loginRequired,
  validators.validate([
    param("notificationId")
      .exists()
      .isString()
      .custom(validators.checkObjectId),
    body("isRead", "Invalid isRead").exists().notEmpty().isBoolean(),
  ]),
  notificationController.updateSingleNotification
);

/**
 * @route PUT /notifications
 * @description update all notifications and return filtered notifications
 * @body {isRead, page, limit}
 * @access login required
 */
router.put(
  "/",
  authentication.loginRequired,
  validators.validate([
    body("isRead", "Invalid isRead").exists().notEmpty().isBoolean(),
  ]),
  notificationController.updateAllNotifications
);

/**
 * @route DELETE /notifications/:notificationId
 * @description delete notification
 * @access login required
 */
router.delete(
  "/:notificationId",
  authentication.loginRequired,
  validators.validate([
    param("notificationId")
      .exists()
      .isString()
      .custom(validators.checkObjectId),
  ]),
  notificationController.deleteSingleNotification
);

/**
 * @route DELETE /notifications
 * @description delete many notifications by filter
 * @query {isRead}
 * @access login required
 */
router.delete(
  "/",
  authentication.loginRequired,
  validators.validate([
    query("isRead", "Invalid isRead")
      .optional({ nullable: true, values: "falsy" })
      .isBoolean(),
  ]),
  notificationController.deleteManyNotifications
);

/**
 * @route POST /notifications/reminders
 * @description create a reminder notification for current user
 * @body { title, message, targetType, targetId, sendTime}
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
