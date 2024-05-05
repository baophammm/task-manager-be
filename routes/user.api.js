const express = require("express");
const userController = require("../controllers/user.controller");
const validators = require("../middlewares/validators");
const { body, param, query } = require("express-validator");
const authentication = require("../middlewares/authentication");
const router = express.Router();

/**
 * @route POST /users
 * @description Create new account
 * @body { firstName, lastName, email, password }
 * @access Public
 */
router.post(
  "/",
  validators.validate([
    body("firstName", "Invalid first name").exists().notEmpty(),
    body("lastName", "Invalid last name").exists().notEmpty(),
    body("email", "Invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  userController.register
);

/**
 * @route GET /users
 * @description Get users with pagination
 * @query {search}
 * @access login required
 */
router.get("/", authentication.loginRequired, userController.getUsers);

/**
 * @route GET /users/me
 * @description Get the current user info
 * @access login required
 */
router.get("/me", authentication.loginRequired, userController.getCurrentUser);

/**
 * @route GET /users/:id
 * @description Get a single user info
 * @access login required
 */
router.get(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  userController.getSingleUser
);

/**
 * @route PUT /users/:id
 * @description Update user profile
 * @body { firstName, lastName. profilePictureUrl }
 * @access login required
 */
router.put(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  userController.updateProfile
);

/**
 * @route DELETE /users/:id
 * @description Delete a user profile
 * @access login required
 */
router.delete(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  userController.deleteUser
);

/**
 * @route PUT /users/:id/password
 * @description Change user password
 * @body { currentPassword, newPassword }
 * @access login required
 */
router.put(
  "/:id/password",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
    body("currentPassword", "Invalid current password").exists().notEmpty(),
    body("newPassword", "Invalid new password").exists().notEmpty(),
  ]),
  userController.changeUserPassword
);

/**
 * @route POST /users/resetPassword
 * @description Reset user password
 * @body { resetPasswordToken, verificationCode, newPassword }
 * @access Public
 */
router.post(
  "/resetPassword",
  validators.validate([
    body("resetPasswordToken", "Invalid reset password token")
      .exists()
      .isString(),
    body("verificationCode", "Invalid verification code")
      .exists()
      .isString()
      .custom(validators.checkCryptoString),
    body("newPassword", "Invalid new password").exists().notEmpty(),
  ]),
  userController.resetPassword
);

/**
 * @route POST /users/:id/favorite/projects
 * @description Add a project to user's favorite list
 * @body {projectId }
 * @@access login required
 */

router.post(
  "/:id/favorite/projects",
  authentication.loginRequired,
  validators.validate([
    body("projectId").exists().isString().custom(validators.checkObjectId),
  ]),
  userController.addProjectToUserFavorite
);

/**
 * @route GET /users/:id/favorite/projects
 * @description get a list of favorite projects of a user
 * @query { search, projectStatus, currentUserRole, startAfter, startBefore, dueAfter, dueBefore}
 * @access login required
 */

router.get(
  "/:id/favorite/projects",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
    query(
      "currentUserRole",
      "Invalid currentUserRole. Reminder: Case sensitivity"
    )
      .optional()
      .isString()
      .isIn(["Owner", "Lead", "Member"]),
    query("projectStatus", "Invalid Project Status. Reminder: Case sensitivity")
      .optional()
      .isString()
      .isIn(["Planning", "Ongoing", "Done"]),
    query("startAfter", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
    query("startBefore", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
    query("dueAfter", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
    query("dueAfter", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
  ]),
  userController.getUserFavoriteProjects
);

/**
 * @route DELETE /users/:id/favorite/projects/:projectId
 * @description remove project from User's favorite list
 * @access login required
 */

router.delete(
  "/:id/favorite/projects/:projectId",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
    param("projectId").exists().isString().custom(validators.checkObjectId),
  ]),
  userController.removeProjectFromUserFavorite
);
/**
 * @route GET /users/:id/tasks
 * @description get a list of tasks of a user
 * @access login required
 */

/**
 * @route GET /users/me/invitations
 * @description get a list of my sent invitations
 * @access login required - project owner
 */

/**
 * @route GET /users/me/notifications
 * @description get a list of my notifications with pagination
 * @access login required
 */

module.exports = router;
