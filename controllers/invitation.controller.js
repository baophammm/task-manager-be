const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const Invitation = require("../models/Invitation");
const Project = require("../models/Project");
const User = require("../models/User");
const crypto = require("crypto");

const { createNewMongoNotification } = require("./notification.controller");
const Notification = require("../models/Notification");

const invitationController = {};

invitationController.createNewMongoInvitation = async (from, to, project) => {
  try {
    const invitationCode = await crypto.randomBytes(20).toString("hex");
    // secret password (generate by project owner) + with invitation url to join project
    // encrypt the invitation - jwt, hash libraries, nodejs crypto, node21
    let projectInvitationCount = await Invitation.countDocuments({
      to,
      status: "pending",
      isExpired: false,
    });

    let invitation = await Invitation.create({
      from,
      to,
      project,
      invitationCode,
    });

    // create notification on invitation sent

    invitation = await Invitation.findById(invitation._id).populate([
      "from",
      "project",
    ]);

    await Notification.deleteMany({
      title: "Project Invitation",
      to,
      targetType: "Invitation",
      type: "System",
    });

    await createNewMongoNotification({
      title: "Project Invitation",
      // message: `You are invited to join project ${invitation.project.title} by ${invitation.from.firstName} ${invitation.from.lastName} `,
      message: `You are invited to join project ${invitation.project.title}${
        projectInvitationCount > 0
          ? `, along with ${projectInvitationCount} other projects`
          : ""
      }`,
      to: invitation.to,
      sendTime: new Date(),
      targetType: "Invitation",
      targetId: invitation._id,
      type: "System",
    });

    invitation.from = from;
    invitation.project = project;
    return invitation;
  } catch (error) {
    throw new Error("Create New Mongo Invitation Error");
  }
};

invitationController.getCurrentUserIncomingInvitations = catchAsync(
  async (req, res, next) => {
    // Get data from requests
    const currentUserId = req.userId;
    let { page, limit, ...filter } = { ...req.query };
    // Business Logic validation
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    // Process
    let invitationList = await Invitation.find({
      to: currentUserId,
      status: "pending",
      isExpired: false,
    });

    const projectIds = invitationList.map((invitation) => invitation.project);

    const filterConditions = [{ _id: { $in: projectIds } }];

    if (filter.search) {
      filterConditions.push({
        title: { $regex: filter.search, $options: "i" },
      });
    }

    // const currentUser = await User.findOne({
    //   _id: currentUserId,
    //   isDeleted: false,
    // });

    // const filterConditions = [
    //   { isExpired: false },
    //   { toEmail: currentUser.email },
    //   { status: "pending" },
    // ];

    const filterCriteria = filterConditions.length
      ? { $and: filterConditions }
      : {};

    const count = await Project.countDocuments(filterCriteria);
    const totalPages = Math.ceil(count / limit);
    const offset = limit * (page - 1);

    const projects = await Project.find(filterCriteria)
      .sort({ title: 1 })
      .skip(offset)
      .limit(limit)
      .populate("projectOwner");

    const projectsWithInvitation = projects.map((project) => {
      let temp = project.toJSON();
      temp.invitation = invitationList.find((invitation) => {
        if (invitation.project.equals(project._id)) {
          return { status: invitation.status };
        }
        return false;
      });
      return temp;
    });
    // Response
    return sendResponse(
      res,
      200,
      true,
      { projects: projectsWithInvitation, totalPages, count },
      null,
      "Get List of Incoming Invitations successfully"
    );
  }
);

module.exports = invitationController;
