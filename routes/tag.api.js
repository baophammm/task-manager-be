const express = require("express");
const tagController = require("../controllers/tag.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { body, param, query } = require("express-validator");
const tagMiddlewares = require("../middlewares/tagMiddlewares");
const projectMiddlewares = require("../middlewares/projectMiddlewares");
const router = express.Router();

/**
 * @route POST /tags
 * @description Create a tag
 * @body {tagLabel, color: "red" or "yellow" or "orange" or "blue" or "green" or "purple", colorShade: "dark" or "main" or "light", projectId}
 */

router.post(
  "/",
  authentication.loginRequired,
  projectMiddlewares.checkProjectLeadUpdateAccess,
  validators.validate([
    body("tagLabel", "Invalid Tag Label").exists().notEmpty().isString(),
    body("color", "Invalid Color")
      .exists()
      .isString()
      .isIn(["red", "yellow", "orange", "blue", "green", "purple"]),
    body("colorShade", "Invalid Color Shade")
      .exists()
      .isString()
      .isIn(["dark", "main", "light"]),
    body("projectId")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .custom(validators.checkObjectId),
  ]),
  tagMiddlewares.validateTagColor,
  tagController.createNewTag
);

/**
 * @route GET /tags
 * @description Get a list of tags
 * @query {search, projectId}
 * @access login required
 */
router.get(
  "/",
  authentication.loginRequired,
  validators.validate([
    query("search").optional().isString(),
    query("projectId")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .custom(validators.checkObjectId),
  ]),
  tagController.getTags
);

/**
 * @route PUT /tags/:tagId
 * @description Update a tag
 * @body {tagLabel, color: "red" or "yellow" or "orange" or "blue" or "green" or "purple", colorShade: "dark" or "main" or "light"}
 * @access login required
 */

router.put(
  "/:tagId",
  authentication.loginRequired,
  tagMiddlewares.checkTagUpdateAccess,
  validators.validate([
    param("tagId").exists().isString().custom(validators.checkObjectId),
    body("tagLabel", "Invalid Tag Label").exists().notEmpty().isString(),
    body("color", "Invalid Color")
      .exists()
      .isString()
      .isIn(["red", "yellow", "orange", "blue", "green", "purple"]),
    body("colorShade", "Invalid Color Shade")
      .exists()
      .isString()
      .isIn(["dark", "main", "light"]),
  ]),
  tagMiddlewares.validateTagColor,
  tagController.updateSingleTag
);

/**
 * @route DELETE /tags/:tagId
 * @description Delete a tag
 * @access login required
 */

router.delete(
  "/:tagId",
  authentication.loginRequired,
  tagMiddlewares.checkTagUpdateAccess,
  validators.validate([
    param("tagId").exists().isString().custom(validators.checkObjectId),
  ]),
  tagController.deleteSingleTag
);

module.exports = router;
