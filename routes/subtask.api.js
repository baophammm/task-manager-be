const express = require("express");
const subtaskController = require("../controllers/subtask.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { body, param, query } = require("express-validator");
const router = express.Router();

/**
 * @route PUT /subtasks/:subTaskId
 * @description check or uncheck subtask
 * @body { isChecked }
 * @access login required
 */
router.put(
  "/:subTaskId",
  authentication.loginRequired,
  validators.validate([
    param("subTaskId").exists().isString().custom(validators.checkObjectId),
    body("isChecked", "Invalid isChecked").exists().isBoolean(),
  ]),
  subtaskController.updateSubTaskIsChecked
);

/**
 * @route DELETE /subtasks/:subTaskId
 * @description delete a subtask
 * @access login required
 */
router.delete(
  "/:subTaskId",
  authentication.loginRequired,
  validators.validate([
    param("subTaskId").exists().isString().custom(validators.checkObjectId),
  ]),
  subtaskController.deleteSubTask
);

module.exports = router;
