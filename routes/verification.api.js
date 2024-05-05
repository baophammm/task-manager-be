const express = require("express");
const verificationController = require("../controllers/verification.controller");
const validators = require("../middlewares/validators");
const { body, param, query } = require("express-validator");
const authentication = require("../middlewares/authentication");
const router = express.Router();

/**
 * @route PUT /verifications/:verificationCode
 * @description verifying a user through verification Code
 * @access Public
 */
router.put(
  "/:verificationCode",
  validators.validate([
    param("verificationCode")
      .exists()
      .isString()
      .custom(validators.checkCryptoString),
  ]),
  verificationController.verifyNewUser
);

/**
 * @route POST /verifications/requestPasswordReset
 * @description Create new requestPasswordReset
 * @body { email }
 * @access Public
 */
router.post(
  "/requestPasswordReset",
  validators.validate([
    body("email", "Invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
  ]),
  verificationController.requestPasswordReset
);

module.exports = router;
