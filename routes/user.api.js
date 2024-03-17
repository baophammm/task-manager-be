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
 * @route GET /users/me/projects
 * @description get a list of projects of current user
 * @query { search, currentUserRole: Owner or Lead or Member, projectStatus, startAfter, startBefore, dueAfter, dueBefore}
 * @access login required
 */
router.get(
  "/me/projects",
  authentication.loginRequired,
  validators.validate([
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
    query("dueBefore", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
  ]),
  userController.getCurrentUserProjects
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
 * @route GET /users/me/tasks
 * @description get a list of tasks of current user
 * @query {search, taskStatus, priority, projectId, startBefore, startAfter, dueBefore, dueAfter}
 * @access login required
 */
router.get(
  "/me/tasks",
  authentication.loginRequired,
  validators.validate([
    query("taskStatus", "Invalid taskStatus. Reminder: Case sensitivity")
      .optional()
      .isString()
      .isIn(["Backlog", "InProgress", "Completed", "Archived"]),
    query("priority", "Invalid priority. Reminder: Case sensitivity")
      .optional()
      .isString()
      .isIn(["Critical", "High", "Medium", "Low"]),

    query("projectId")
      .optional({ nullable: true, values: "falsy" })
      .isString()
      .custom(validators.checkObjectId),
    query("startAfter", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
    query("startBefore", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
    query("dueAfter", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
    query("dueBefore", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
  ]),
  userController.getCurrentUserTasks
);
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
