const express = require("express");
const invitationController = require("../controllers/invitation.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { body, param, query } = require("express-validator");
const router = express.Router();

/**
 * @route GET /invitations/incoming
 * @description get a list of current user's incoming invitations with pagination
 * @access login required
 */
router.get(
  "/incoming",
  authentication.loginRequired,
  invitationController.getCurrentUserIncomingInvitations
);

/**
 * @route GET /invitations/outgoing
 * @description get a list of current user's outgoing invitations with pagination
 * @access login required
 * not too urgent
 */

module.exports = router;
