const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const Invitation = require("../models/Invitation");
const Project = require("../models/Project");
const User = require("../models/User");
const crypto = require("crypto");

const invitationController = {};

invitationController.createNewMongoInvitation = async (
  from,
  toEmail,
  projectId
) => {
  try {
    const invitationCode = await crypto.randomBytes(20).toString("hex");
    // secret password (generate by project owner) + with invitation url to join project
    // encrypt the invitation - jwt, hash libraries, nodejs crypto, node21
    let invitation = await Invitation.create({
      from,
      toEmail,
      projectId,
      invitationCode,
    });

    return invitation;
  } catch (error) {
    throw new Error("Create New Mongo Invitation Error");
  }
};

invitationController.getCurrentUserIncomingInvitations = catchAsync(
  async (req, res, next) => {
    // Get data from requests
    const currentUserId = req.userId;
    let { page, limit } = req.params;
    // Business Logic validation
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    // Process
    const currentUser = await User.findOne({
      _id: currentUserId,
      isDeleted: false,
    });

    const filterConditions = [
      { isExpired: false },
      { toEmail: currentUser.email },
      { status: "pending" },
    ];

    const filterCriteria = filterConditions.length
      ? { $and: filterConditions }
      : {};

    const count = await Invitation.countDocuments(filterCriteria);
    const totalPages = Math.ceil(count / limit);
    const offset = limit * (page - 1);
    const invitations = await Invitation.find(filterCriteria)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    // Response
    return sendResponse(
      res,
      200,
      true,
      { invitations, totalPages, count },
      null,
      "Get List of Incoming Invitations successfully"
    );
  }
);

module.exports = invitationController;
