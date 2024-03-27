const express = require("express");
const checklistItemController = require("../controllers/checklistItem.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { body, param, query } = require("express-validator");
const router = express.Router();

/**
 * @route PUT /checklistItems/:checklistItemId
 * @description update a checklist item
 * @body { itemTitle, isChecked }
 * @access login required
 */
router.put(
  "/:checklistItemId",
  authentication.loginRequired,
  validators.validate([
    param("checklistItemId")
      .exists()
      .isString()
      .custom(validators.checkObjectId),
    body("isChecked", "Invalid isChecked")
      .optional({ nullable: true, values: "falsy" })
      .isBoolean(),
  ]),
  checklistItemController.updateSingleChecklistItem
);

/**
 * @route DELETE /checklistItems/:checklistItemId
 * @description delete a checklist item
 * @access login required
 */
router.delete(
  "/:checklistItemId",
  authentication.loginRequired,
  validators.validate([
    param("checklistItemId")
      .exists()
      .isString()
      .custom(validators.checkObjectId),
  ]),
  checklistItemController.deleteSingleChecklistItem
);
module.exports = router;
