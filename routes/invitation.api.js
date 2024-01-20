const express = require("express");
const router = express.Router();

/**
 * @route POST /invitations
 * @description create an invitation to targeted email to open account
 * @body { toEmail, projectID }
 * @access login required - project owner
 */

/**
 * @route PUT /invitations/:id
 * @description update a sent invitation
 * @body { toEmail, projectID }
 * @access login required - project owner
 */

/**
 * @route PUT /invitations/:id
 * @description accept an invitation
 * @body { isAccepted }
 * @access Public/login required - invitee receiving invitation - to check later
 */

/**
 * @route DELETE /invitations/:id
 * @description delete an invitation
 * @access login required - project owner
 */

module.exports = router;
