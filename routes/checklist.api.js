const express = require("express");
const checklistController = require("../controllers/checklist.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { body, param, query } = require("express-validator");
const router = express.Router();

/**
 * @route PUT /checklists/:checklistId
 * @description update a checklist
 * @body { checklistTitle }
 * @access login required
 */
router.put(
  "/:checklistId",
  authentication.loginRequired,
  validators.validate([
    param("checklistId").exists().isString().custom(validators.checkObjectId),
    body("checklistTitle", "Invalid Checklist Title").exists().notEmpty(),
  ]),
  checklistController.updateSingleChecklist
);

/**
 * @route DELETE /checklists/:checklistId
 * @description delete a checklist
 * @access login required
 */
router.delete(
  "/:checklistId",
  authentication.loginRequired,
  validators.validate([
    param("checklistId").exists().isString().custom(validators.checkObjectId),
  ]),
  checklistController.deleteSingleChecklist
);

/**
 * @route POST /checklists/:checklistId/checklistItems
 * @description create a checklist item in a checklist
 * @body { itemTitle }
 * @access login required
 */
router.post(
  "/:checklistId/checklistItems",
  authentication.loginRequired,
  validators.validate([
    param("checklistId").exists().isString().custom(validators.checkObjectId),
    body("itemTitle", "Invalid Item Text").exists().notEmpty(),
  ]),
  checklistController.createNewChecklistItemInChecklist
);

/**
 * @route GET /checklists/:checklistId/checklistItems
 * @description get a list of checklist items in a checklist
 * @access login required
 */

router.get(
  "/:checklistId/checklistItems",
  authentication.loginRequired,
  validators.validate([
    param("checklistId").exists().isString().custom(validators.checkObjectId),
  ]),
  checklistController.getChecklistItemsOfChecklist
);
module.exports = router;
