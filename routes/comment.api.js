const express = require("express");
const validators = require("../middlewares/validators");
const authentication = require("../middlewares/authentication");
const { body, param } = require("express-validator");
const commentController = require("../controllers/comment.controller");
const router = express.Router();

/**
 * @route POST /comments
 * @description Create a comment
 * @body { targetType: "Task" or "Project", targetId, content, files } // files only allow if targetType is Task
 * @access login required
 */

router.post(
  "/",
  authentication.loginRequired,
  validators.validate([
    body("content", "Missing content").exists().notEmpty(),
    body("targetType").exists().isString().isIn(["Task", "Project"]),
    body("targetId", "Missing targetId")
      .exists()
      .isString()
      .custom(validators.checkObjectId),
  ]),
  commentController.createNewComment
);
/**
 * @route PUT /comments/:id
 * @description Edit comment content
 * @body { content, files }
 * @access login required
 */
router.put(
  "/:commentId",
  authentication.loginRequired,
  validators.validate([
    param("commentId").exists().isString().custom(validators.checkObjectId),
    body("content", "Missing content").exists().notEmpty(),
  ]),
  commentController.updateSingleComment
);

/**
 * @route DELETE /comments/:id
 * @description Delete a comment
 * @access login required
 */
router.delete(
  "/:commentId",
  authentication.loginRequired,
  validators.validate([
    param("commentId").exists().isString().custom(validators.checkObjectId),
  ]),
  commentController.deleteSingleComment
);

/**
 * @route GET /comments/:id
 * @description Get detail of a comment
 * @access login required
 */
router.get(
  "/:commentId",
  authentication.loginRequired,
  validators.validate([
    param("commentId").exists().isString().custom(validators.checkObjectId),
  ]),
  commentController.getSingleComment
);

module.exports = router;
