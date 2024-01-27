const express = require("express");
const projectController = require("../controllers/project.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { body, param, query } = require("express-validator");

const router = express.Router();

/**
 * @route POST /projects
 * @description Create a project
 * @body {title, description, projectStatus, startAt, dueAt, projectMemberEmails}
 * @access login required
 */
router.post(
  "/",
  authentication.loginRequired,
  validators.validate([
    body("title", "Invalid Title").exists().notEmpty(),
    body("description", "Invalid Description").exists().notEmpty(),
    body("projectStatus", "Invalid Project Status. Reminder: Case sensitivity")
      .optional()
      .isString()
      .isIn(["Planning", "Ongoing", "Done"]),
    body("startAt", "Invalid Date Format").optional().isDate(),
    body("dueAt", "Invalid Date Format").optional().isDate(),
    body("projectMemberEmails")
      .optional()
      .isArray()
      .custom(validators.checkArrayOfEmail),
  ]),
  projectController.createNewProject
);

/**
 * @route GET /projects
 * @description Get a list of projects
 * @query { search, projectStatus, projectOwner, startAfter, startBefore, dueAfter, dueBefore}
 * @access login required
 */
router.get(
  "/",
  authentication.loginRequired,
  validators.validate([
    query("projectStatus", "Invalid Project Status. Reminder: Case sensitivity")
      .optional()
      .isString()
      .isIn(["Planning", "Ongoing", "Done"]),
    query("projectOwner")
      .optional()
      .isString()
      .custom(validators.checkObjectId),
    query("startAfter", "Invalid Date Format").optional().isDate(),
    query("startBefore", "Invalid Date Format").optional().isDate(),
    query("dueAfter", "Invalid Date Format").optional().isDate(),
    query("dueAfter", "Invalid Date Format").optional().isDate(),
  ]),
  projectController.getProjects
);

/**
 * @route GET /projects/:id
 * @description get detail of a project
 * @access login required
 */
router.get(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  projectController.getSingleProject
);

/**
 * @route GET /projects/:id/projectMembers
 * @description Get list of project members of a project
 * @query {search}
 * @access login required
 */
router.get(
  "/:id/projectMembers",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  projectController.getMembersOfSingleProject
);

/**
 * @route PUT /projects/:id
 * @description Update project
 * @body { title, description, projectStatus, startAt, dueAt, newProjectManagers, newProjectMemberEmails }
 * @access login required - project owner only
 */
router.put(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
    body("projectStatus", "Invalid Project Status. Reminder: Case sensitivity")
      .optional()
      .isString()
      .isIn(["Planning", "Ongoing", "Done"]),
    body("startAt", "Invalid Date Format").optional().isDate(),
    body("dueAt", "Invalid Date Format").optional().isDate(),
  ]),
  projectController.updateSingleProject
);

/**
 * @route DELETE /projects/:id
 * @description delete a project
 * @access login required - project owner
 */
router.delete(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  projectController.deleteSingleProject
);

/**
 * @route POST /projects/:id/invitations
 * @description send an invitation to a project member
 * @body { toEmail }
 * @access login required
 */
router.post(
  "/:id/invitations",
  authentication.loginRequired,
  validators.validate([
    param("id", "Invalid Project ID")
      .exists()
      .isString()
      .custom(validators.checkObjectId),
    body("toEmail").exists().isString().custom(validators.checkEmail),
  ]),
  projectController.createNewProjectInvitation
);

/**
 * @route GET /projects/:id/invitations
 * @description Get a list of my project invitations with pagination
 * @query {search, status}
 * @access login required
 */

router.get(
  "/:id/invitations",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
    query("status", "Invalid Status")
      .optional()
      .isString()
      .isIn(["pending", "accepted", "declined", "canceled"]),
  ]),
  projectController.getProjectInvitations
);

/**
 * @route DELETE /projects/:id/invitations/:invitationCode
 * @description Cancel an invitation
 * @access login required
 */
router.delete(
  "/:id/invitations/:invitationCode",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
    param("invitationCode")
      .exists()
      .isString()
      .custom(validators.checkCryptoString),
  ]),
  projectController.cancelSingleProjectInvitation
);

/**
 * @route PUT /projects/:id/invitations/:invitationCode
 * @description React to an invitation
 * @body { status: "accepted", "declined" }
 * @access login required
 */
router.put(
  "/:id/invitations/:invitationCode",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
    param("invitationCode")
      .exists()
      .isString()
      .custom(validators.checkCryptoString),
    body("status", "Invalid status")
      .exists()
      .isString()
      .isIn(["accepted", "declined"]),
  ]),
  projectController.reactProjectInvitation
);

/**
 * @route PUT /projects/:id/projectMembers/:memberId
 * @description change role of a project member
 * @body { isNewManager: true or false }
 * @access login required
 */
router.put(
  "/:id/projectMembers/:memberId",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
    param("memberId").exists().isString().custom(validators.checkObjectId),
    body("isNewManager", "Invalid isNewManager")
      .exists()
      .notEmpty()
      .isBoolean()
      .isIn([true, false]),
  ]),
  projectController.updateManagerRoleOfSingleMember
);

/**
 * @route DELETE /projects/:id/projectMembers/:memberId
 * @description remove a member from project
 * @access login required
 */
router.delete(
  "/:id/projectMembers/:memberId",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
    param("memberId").exists().isString().custom(validators.checkObjectId),
  ]),
  projectController.removeSingleMemberFromProject
);

/**
 * @route POST /projects/:id/tasks
 * @description Create New Project Task
 * @body {title, description, taskStatus, taskPriority, assigneeId, startAt, dueAt, files}
 * @access login required
 */

/**
 * @route GET /projects/:id/tasks
 * @description get a list of tasks of a project with pagination
 * @query {search, taskStatus, priority, assigneeId, startBefore, startAfter, dueBefore, dueAfter}
 * @access login required
 */
router.get(
  "/:id/tasks",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
    query("taskStatus", "Invalid taskStatus. Reminder: Case sensitivity")
      .optional()
      .isString()
      .isIn([
        "Backlog",
        "Pending",
        "InProgress",
        "WaitingForReview",
        "Reviewed",
        "Completed",
        "Archived",
      ]),
    query("priority", "Invalid priority. Reminder: Case sensitivity")
      .optional()
      .isString()
      .isIn(["Critical", "High", "Medium", "Low"]),
    query("assigneeId").optional().isString().custom(validators.checkObjectId),
    query("startAfter", "Invalid Date Format").optional().isDate(),
    query("startBefore", "Invalid Date Format").optional().isDate(),
    query("dueAfter", "Invalid Date Format").optional().isDate(),
    query("dueAfter", "Invalid Date Format").optional().isDate(),
  ]),
  projectController.getTasksOfSingleProject
);

/**
 * @route GET /projects/:id/projectMembers/:memberId/tasks
 * @description get list of tasks of a project member within a project
 * @query {search, taskStatus, priority, startBefore, startAfter, dueBefore, dueAfter}
 * @access login required
 */

/**
 * @route GET /projects/:id/tasks/:taskId
 * @description get single task of a project
 * @access login required
 */

/**
 * @route PUT /projects/:id/tasks/:taskId
 * @description update a single project task
 * @body { title, description, assigneeId, taskStatus: "Backlog" or "Pending" or "InProgress" or "Completed" or "Reviewed" or "Archived", priority: "Critical" or "High" or "Medium" or "Low", startAt, dueAt, files }
 * @access login required
 */

/**
 * @route DELETE /projects/:id/tasks/:taskId
 * @description delete a single project task
 * @access login required
 */

/**
 * @route GET /projects/:id/comments
 * @description get a list of comments of a project with pagination
 * @access login required
 */

module.exports = router;
