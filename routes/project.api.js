const express = require("express");
const projectController = require("../controllers/project.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { body, param, query } = require("express-validator");
const projectMiddlewares = require("../middlewares/projectMiddlewares");

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
    body("startAt", "Invalid Date Format").exists().notEmpty().isDate(),
    body("dueAt", "Invalid Date Format").exists().notEmpty().isDate(),
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
  projectMiddlewares.checkProjectAccess,
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
  projectMiddlewares.checkProjectAccess,
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
  projectMiddlewares.checkProjectOwnerUpdateAccess,
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
  projectMiddlewares.checkProjectOwnerUpdateAccess,
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
  projectMiddlewares.checkProjectOwnerUpdateAccess,
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
  projectMiddlewares.checkProjectOwnerUpdateAccess,
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
  projectMiddlewares.checkProjectOwnerUpdateAccess,
  validators.validate([
    param("projectId").exists().isString().custom(validators.checkObjectId),
    param("memberId").exists().isString().custom(validators.checkObjectId),
  ]),
  projectController.removeSingleMemberFromProject
);

/**
 * @route POST /projects/:projectId/tags
 * @description create a new project tag
 * @body {
 * tagLabel,
 * color: "red" or "yellow" or "orange" or "blue" or "green" or "purple",
 * colorShade: "dark" or "main" or "light"}
 * @access login required
 */
router.post(
  "/:projectId/tags",
  authentication.loginRequired,
  projectMiddlewares.checkProjectLeadUpdateAccess,
  validators.validate([
    param("projectId").exists().isString().custom(validators.checkObjectId),
    body("tagLabel", "Invalid Tag Label").exists().notEmpty(),
    body("color", "Invalid Tag Color")
      .exists()
      .isString()
      .isIn(["red", "yellow", "orange", "blue", "green", "purple"]),
    body("colorShade", "Invalid Tag Color Shade")
      .exists()
      .isString()
      .isIn(["dark", "main", "light"]),
  ]),
  projectController.createNewProjectTag
);

/**
 * @route GET /projects/:projectId/tags
 * @description get a list of project tags'
 * @query { search }
 * @access login required
 */
router.get(
  "/:projectId/tags",
  authentication.loginRequired,
  projectMiddlewares.checkProjectAccess,
  validators.validate([
    param("projectId").exists().isString().custom(validators.checkObjectId),
  ]),
  projectController.getProjectTags
);

/**
 * @route GET /projects/:projectId/comments
 * @description get a list of comments of a project with pagination
 * @access login required
 */

module.exports = router;
