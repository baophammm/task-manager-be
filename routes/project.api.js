const express = require("express");
const projectController = require("../controllers/project.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { body, param, query } = require("express-validator");

const router = express.Router();

/**
 * @route POST /projects
 * @description Create a project
 * @body {title, description, projectStatus, startAt, dueAt, projectMembers}
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
    body("startAt", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy", values: "falsy" })
      .isDate(),
    body("dueAt", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy", values: "falsy" })
      .isDate(),
    body("projectMembers")
      .optional()
      .isArray()
      .custom(validators.checkArrayOfObjectId),
  ]),
  projectController.createNewProject
);

/**
 * @route GET /projects
 * @description Get a list of projects
 * @query { search, projectStatus, currentUserRole, startAfter, startBefore, dueAfter, dueBefore, sortBy: ["title_asc", "title_desc", "created_at_asc", "created_at_desc"]}
 * @access login required
 */
router.get(
  "/",
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
    query("dueAfter", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
    query("sortBy", "Invalid Sort By")
      .optional({ nullable: true, values: "falsy" })
      .isString()
      .isIn(["title_asc", "title_desc", "created_at_asc", "created_at_desc"]),
  ]),
  projectController.getProjects
);

/**
 * @route GET /projects/:projectId
 * @description get detail of a project
 * @access login required
 */
router.get(
  "/:projectId",
  authentication.loginRequired,
  validators.validate([
    param("projectId").exists().isString().custom(validators.checkObjectId),
  ]),
  projectController.getSingleProject
);

/**
 * @route GET /projects/:projectId/projectMembers
 * @description Get list of project members of a project
 * @query {search}
 * @access login required
 */
router.get(
  "/:projectId/projectMembers",
  authentication.loginRequired,
  validators.validate([
    param("projectId").exists().isString().custom(validators.checkObjectId),
  ]),
  projectController.getMembersOfSingleProject
);

/**
 * @route PUT /projects/:projectId
 * @description Update project
 * @body { title, description, projectStatus, startAt, dueAt}
 * @access login required - project owner only
 */
router.put(
  "/:projectId",
  authentication.loginRequired,
  validators.validate([
    param("projectId").exists().isString().custom(validators.checkObjectId),
    body("projectStatus", "Invalid Project Status. Reminder: Case sensitivity")
      .optional()
      .isString()
      .isIn(["Planning", "Ongoing", "Done"]),
    body("startAt", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
    body("dueAt", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
  ]),
  projectController.updateSingleProject
);

/**
 * @route DELETE /projects/:projectId
 * @description delete a project
 * @access login required - project owner
 */
router.delete(
  "/:projectId",
  authentication.loginRequired,
  validators.validate([
    param("projectId").exists().isString().custom(validators.checkObjectId),
  ]),
  projectController.deleteSingleProject
);

/**
 * @route GET /projects/:projectId/newMembers
 * @description get a list of new users to be added to the project and their invitation status
 * @access login required
 */
router.get(
  "/:projectId/newMembers",
  authentication.loginRequired,
  validators.validate([
    param("projectId", "Invalid Project ID")
      .exists()
      .isString()
      .custom(validators.checkObjectId),
  ]),
  projectController.getProjectAddNewMembers
);

/**
 * @route POST /projects/:projectId/invitations
 * @description send an invitation to a project member
 * @body { to }
 * @access login required
 */
router.post(
  "/:projectId/invitations",
  authentication.loginRequired,
  validators.validate([
    param("projectId", "Invalid Project ID")
      .exists()
      .isString()
      .custom(validators.checkObjectId),
    body("to").exists().isString().custom(validators.checkObjectId),
  ]),
  projectController.createNewProjectInvitation
);

/**
 * @route GET /projects/:projectId/invitations
 * @description Get a list of my project invitations with pagination
 * @query {search, status}
 * @access login required
 */

router.get(
  "/:projectId/invitations",
  authentication.loginRequired,
  validators.validate([
    param("projectId").exists().isString().custom(validators.checkObjectId),
    query("status", "Invalid Status")
      .optional()
      .isString()
      .isIn(["pending", "accepted", "declined", "canceled"]),
  ]),
  projectController.getProjectInvitations
);

/**
 * @route DELETE /projects/:projectId/invitations/:inviteeId
 * @description Cancel an invitation
 * @access login required
 */
router.delete(
  "/:projectId/invitations/:inviteeId",
  authentication.loginRequired,
  validators.validate([
    param("projectId").exists().isString().custom(validators.checkObjectId),
    param("inviteeId").exists().isString().custom(validators.checkObjectId),
  ]),
  projectController.cancelSingleProjectInvitation
);

/**
 * @route PUT /projects/:projectId/invitations/:inviteeId
 * @description React to an invitation
 * @body { status: "accepted", "declined" }
 * @access login required
 */
router.put(
  "/:projectId/invitations/:inviteeId",
  authentication.loginRequired,
  validators.validate([
    param("projectId").exists().isString().custom(validators.checkObjectId),
    param("inviteeId").exists().isString().custom(validators.checkObjectId),
    body("status", "Invalid status")
      .exists()
      .isString()
      .isIn(["accepted", "declined"]),
  ]),
  projectController.reactProjectInvitation
);

/**
 * @route PUT /projects/:projectId/projectMembers/:memberId
 * @description change role of a project member
 * @body { isNewLead: true or false }
 * @access login required
 */
router.put(
  "/:projectId/projectMembers/:memberId",
  authentication.loginRequired,
  validators.validate([
    param("projectId").exists().isString().custom(validators.checkObjectId),
    param("memberId").exists().isString().custom(validators.checkObjectId),
    body("isNewLead", "Invalid isNewLead")
      .exists()
      .notEmpty()
      .isBoolean()
      .isIn([true, false]),
  ]),
  projectController.updateLeadRoleOfSingleMember
);

/**
 * @route DELETE /projects/:projectId/projectMembers/:memberId
 * @description remove a member from project
 * @access login required
 */
router.delete(
  "/:projectId/projectMembers/:memberId",
  authentication.loginRequired,
  validators.validate([
    param("projectId").exists().isString().custom(validators.checkObjectId),
    param("memberId").exists().isString().custom(validators.checkObjectId),
  ]),
  projectController.removeSingleMemberFromProject
);

/**
 * @route POST /projects/:projectId/tasks
 * @description Create New Project Task
 * @body {title, description, taskStatus, taskPriority, assigneeId, startAt, dueAt, files}
 * @access login required
 */

/**
 * @route GET /projects/:projectId/tasks
 * @description get a list of tasks of a project with pagination
 * @query {search, taskStatus, priority, assigneeId, startBefore, startAfter, dueBefore, dueAfter}
 * @access login required
 */
router.get(
  "/:projectId/tasks",
  authentication.loginRequired,
  validators.validate([
    param("projectId").exists().isString().custom(validators.checkObjectId),
    query("taskStatus", "Invalid taskStatus. Reminder: Case sensitivity")
      .optional()
      .isString()
      .isIn(["Backlog", "InProgress", "Completed", "Archived"]),
    query("priority", "Invalid priority. Reminder: Case sensitivity")
      .optional()
      .isString()
      .isIn(["Critical", "High", "Medium", "Low"]),
    query("assigneeId")
      .optional({ nullable: true, values: "falsy" })
      .isString()
      .custom(validators.checkObjectId),
    query("startAfter", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
    query("startBefore", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
    query("dueBefore", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
    query("dueAfter", "Invalid Date Format")
      .optional({ nullable: true, values: "falsy" })
      .isDate(),
  ]),
  projectController.getTasksOfSingleProject
);

/**
 * @route GET /projects/:projectId/projectMembers/:memberId/tasks
 * @description get list of tasks of a project member within a project
 * @query {search, taskStatus, priority, startBefore, startAfter, dueBefore, dueAfter}
 * @access login required
 */

/**
 * @route GET /projects/:projectId/tasks/:taskId
 * @description get single task of a project
 * @access login required
 */

/**
 * @route PUT /projects/:projectId/tasks/:taskId
 * @description update a single project task
 * @body { title, description, assigneeId, taskStatus: "Backlog" or "Pending" or "InProgress" or "Completed" or "Reviewed" or "Archived", priority: "Critical" or "High" or "Medium" or "Low", startAt, dueAt, files }
 * @access login required
 */

/**
 * @route DELETE /projects/:projectId/tasks/:taskId
 * @description delete a single project task
 * @access login required
 */

/**
 * @route GET /projects/:projectId/comments
 * @description get a list of comments of a project with pagination
 * @access login required
 */

module.exports = router;
