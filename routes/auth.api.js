const express = require("express");

const authController = require("../controllers/auth.controller");
const validators = require("../middlewares/validators");
const { body } = require("express-validator");
const router = express.Router();

/**
 * @route POST /auth/login
 * @description Login with email and password
 * @body { email, password }
 * @access Public
 */
router.post(
  "/login",
  validators.validate([
    body("email", "Invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  authController.loginWithEmail
);

/**
 * @route POST /auth/login/google
 * @description Login with google
 * @body {email, firstName, lastName, profilePictureUrl, isGoogleVerified, googleId}
 * @access Public
 */
router.post(
  "/login/google",
  validators.validate([
    body("email", "Invalid email").exists().isEmail(),
    body("firstName", "Invalid firstName").exists().notEmpty(),
    body("lastName", "Invalid lastName").exists().notEmpty(),
    body("profilePictureUrl", "Invalid profilePictureUrl").exists().notEmpty(),
    body("isGoogleVerified", "Invalid isGoogleVerified").exists().isBoolean(),
    body("googleId", "Invalid googleId").exists().notEmpty(),
  ]),
  authController.loginWithGoogle
);

module.exports = router;
