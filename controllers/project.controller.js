const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const Project = require("../models/Project");
const User = require("../models/User");
const Invitation = require("../models/Invitation");
const crypto = require("crypto");
const { createNewMongoInvitation } = require("./invitation.controller");

const projectController = {};

projectController.calculateProjectOwnCount = async (userId) => {
  try {
    const projectOwnCount = await Project.countDocuments({
      projectOwner: userId,
      isDeleted: false,
    });

    await User.findByIdAndUpdate(userId, { projectOwnCount });
  } catch (error) {
    throw new Error("Calculate Project Own Count Error");
  }
};

projectController.calculateProjectInCount = async (userId) => {
  try {
    const projectInCount = await Project.countDocuments({
      projectMembers: userId,
      isDeleted: false,
    });

    await User.findByIdAndUpdate(userId, { projectInCount });
  } catch (error) {
    throw new Error("Calculate Project In Count Error");
  }
};

projectController.createNewProject = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  let {
    title,
    description,
    projectStatus,
    startAt,
    dueAt,
    projectMemberEmails,
  } = req.body;

  // Business logic validation
  const currentUser = await User.findById(currentUserId);
  const currentUserEmail = currentUser.email;

  if (projectMemberEmails) {
    // cannot send invitation to self
    if (projectMemberEmails.includes(currentUserEmail))
      throw new AppError(
        400,
        "Users cannot send invitation to themselves",
        "Create New Project Error"
      );
  }
  // Process

  let project = await Project.create({
    title,
    description,
    projectStatus,
    projectOwner: currentUserId,
    startAt,
    dueAt,
  });

  await projectController.calculateProjectOwnCount(currentUserId);

  // After a project is created, make invitation to each member email list
  if (projectMemberEmails) {
    // send invitation
    const projectId = project._id;
    projectMemberEmails.map(async (toEmail) => {
      await createNewMongoInvitation(currentUserId, toEmail, projectId);
    });
  }

  // Response
  return sendResponse(
    res,
    200,
    true,
    project,
    null,
    "Create New Project successfully"
  );
});

projectController.getProjects = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  let { page, limit, ...filter } = { ...req.query };

  // Business logic validation
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  // check filter input
  const allows = [
    "search",
    "projectStatus",
    "projectOwner",
    "startAfter",
    "startBefore",
    "dueAfter",
    "dueBefore",
  ];

  const filterKeys = Object.keys(filter);

  filterKeys.map((key) => {
    if (!allows.includes(key))
      throw new AppError(
        400,
        `Key ${key} is not allowed. Reminder: Case sensitivity`,
        "Get List of Projects Error"
      );
  });

  // Process
  const filterConditions = [
    {
      isDeleted: false,
    },
    {
      $or: [{ projectOwner: currentUserId }, { projectMembers: currentUserId }], // only projects that current user owns or is a member in
    },
  ];

  // query filters
  filterKeys.forEach((field) => {
    if (filter[field]) {
      const condition = (() => {
        switch (field) {
          case "search":
            return {
              $or: [
                { title: { $regex: filter[field], $options: "i" } },
                { description: { $regex: filter[field], $options: "i" } },
              ],
            };
          case "startAfter":
            return { startAt: { $gte: filter[field] } };
          case "startBefore":
            return { startAt: { $lte: filter[field] } };
          case "dueAfter":
            return { dueAt: { $gte: filter[field] } };
          case "dueBefore":
            return { dueAt: { $lte: filter[field] } };
          default:
            return { [field]: filter[field] };
        }
      })();
      filterConditions.push(condition);
    }
  });

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};
  console.log(filterConditions[1].$or);
  const count = await Project.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let projects = await Project.find(filterCriteria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  // Response
  return sendResponse(
    res,
    200,
    true,
    { projects, totalPages, count },
    null,
    "Get List of Projects successfully"
  );
});

projectController.getSingleProject = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  const projectId = req.params.id;

  // Business logic validation
  const filterConditions = [
    { _id: projectId },
    { isDeleted: false },
    {
      $or: [{ projectOwner: currentUserId }, { projectMembers: currentUserId }], // project only shows up when current user owns it or is a member in it
    },
  ];

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  let project = await Project.findOne(filterCriteria);

  if (!project)
    throw new AppError(
      400,
      "Project not found or Unauthorized to see project",
      "Get Single Project Error"
    );
  // Process
  // Response
  return sendResponse(
    res,
    200,
    true,
    project,
    null,
    "Get Single Project successfully"
  );
});

projectController.getMembersOfSingleProject = catchAsync(
  async (req, res, next) => {
    // Get data from requests
    const currentUserId = req.userId;
    const projectId = req.params.id;
    let { page, limit } = req.query;
    // Business logic validation
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const filterConditions = [
      { _id: projectId },
      { isDeleted: false },
      {
        $or: [
          { projectOwner: currentUserId },
          { projectMembers: currentUserId },
        ], // project only shows up when current user owns it or is a member in it
      },
    ];

    const filterCriteria = filterConditions.length
      ? { $and: filterConditions }
      : {};

    let project = await Project.findOne(filterCriteria);

    if (!project)
      throw new AppError(
        400,
        "Project not found or Unauthorized to see project",
        "Get Members of Single Project Error"
      );
    // Process
    const memberFilterConditions = [
      { isDeleted: false },
      { _id: { $in: project.projectMembers } }, //select only users in the project
    ];

    // query filters
    if (req.query.search) {
      memberFilterConditions.push({
        $or: [
          { firstName: { $regex: req.query.search, $options: "i" } },
          { lastName: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      });
    }

    const memberFilterCriteria = memberFilterConditions.length
      ? { $and: memberFilterConditions }
      : {};

    let count = await User.countDocuments(memberFilterCriteria);
    let totalPages = Math.ceil(count / limit);
    let offset = limit * (page - 1);
    let projectMembers = await User.find(memberFilterCriteria)
      .sort({ lastName: 1 })
      .skip(offset)
      .limit(limit);

    // Response
    return sendResponse(
      res,
      200,
      true,
      { projectMembers, totalPages, count },
      null,
      "Get Project Member List of A Project successfully"
    );
  }
);

projectController.updateSingleProject = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  const projectId = req.params.id;

  // Business logic validation

  const filterConditions = [
    { _id: projectId },
    { isDeleted: false },
    {
      $or: [{ projectOwner: currentUserId }, { projectMembers: currentUserId }], // project only shows up when current user owns it or is a member in it
    },
  ];

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  let project = await Project.findOne(filterCriteria).populate(
    "projectMembers"
  );

  if (!project)
    throw new AppError(
      400,
      "Project not found or Unauthorized to edit project",
      "Update Single Project Error"
    );

  if (req.body.startAt && req.body.dueAt) {
    if (req.body.dueAt < req.body.startAt)
      throw new AppError(
        400,
        "Due date cannot be before start date",
        "Update Single Project Error"
      );
  }

  // Process
  const allows = [
    "title",
    "description",
    "projectStatus",
    "startAt",
    "dueAt",
    "newProjectManagers",
    "newProjectMemberEmails",
  ];

  const currentUser = await User.findById(currentUserId);
  const currentUserEmail = currentUser.email;

  allows.forEach(async (field) => {
    if (req.body[field] !== undefined) {
      project[field] = req.body[field];
    }
  });

  await project.save();
  // Response
  return sendResponse(
    res,
    200,
    true,
    project,
    null,
    "Update Single Project successfully"
  );
});

projectController.deleteSingleProject = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  const projectId = req.params.id;
  // Business logic validation
  let project = await Project.findOne({ _id: projectId, isDeleted: false });
  if (!project)
    throw new AppError(400, "Project not found", "Delete Single Project Error");

  if (!project.projectOwner.equals(currentUserId))
    throw new AppError(
      400,
      "Only project owner can delete project",
      "Delete Single Project Error"
    );
  // Process
  project.isDeleted = true;
  await project.save();
  await projectController.calculateProjectOwnCount(currentUserId);

  project.projectMembers.map(async (projectMember) => {
    await projectController.calculateProjectInCount(projectMember);
  });
  // calculate Project In count for each members
  // Response
  return sendResponse(
    res,
    200,
    true,
    project,
    null,
    "Delete Single Project successfully"
  );
});

projectController.createNewProjectInvitation = catchAsync(
  async (req, res, next) => {
    // Get data from requests
    const currentUserId = req.userId;
    const projectId = req.params.id;
    const toEmail = req.body.toEmail;

    // Business logic validation

    let project = await Project.findOne({
      _id: projectId,
      projectOwner: currentUserId,
      isDeleted: false,
    });

    if (!project)
      throw new AppError(
        400,
        "Cannot find project or Unauthorized to invite member to this project",
        "Create New Project Invitation Error"
      );

    // check if project already has member with inviting email
    // get list of emails of current project members
    let projectMembersInfo = await User.find({
      _id: { $in: project.projectMembers },
      isDeleted: false,
    });

    let projectMemberEmails = projectMembersInfo.map((member) => member.email);

    if (projectMemberEmails.includes(toEmail))
      throw new AppError(
        400,
        "Invitee already a project member",
        "Create New Project Invitation Error"
      );
    // Process
    // Delete all previous invitations with same inviter, project and invitee
    await Invitation.deleteMany({
      from: currentUserId,
      toEmail,
      projectId,
    });

    // make Invitation to user

    let invitation = await createNewMongoInvitation(
      currentUserId,
      toEmail,
      projectId
    );

    // Response
    return sendResponse(
      res,
      200,
      true,
      invitation,
      null,
      "Create New Project Invitation successfully"
    );
  }
);

projectController.getProjectInvitations = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  const projectId = req.params.id;
  let { page, limit, ...filter } = { ...req.query };

  // Business logic validation
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const allows = ["search", "status"];

  const filterKeys = Object.keys(filter);

  filterKeys.map((key) => {
    if (!allows.includes(key))
      throw new AppError(
        400,
        `Key ${key} is not allowed. Reminder: Case sensitivity`,
        "Get List of Project Invitations Error"
      );
  });

  const project = await Project.findOne({
    _id: projectId,
    projectOwner: currentUserId,
    isDeleted: false,
  });

  if (!project)
    throw new AppError(
      401,
      "Project Not Found or Unauthorized to see Project Invitations",
      "Get List of Project Invitations Error"
    );

  // Process
  const filterConditions = [
    { projectId }, //check invitations of selected project only
    { from: currentUserId }, //only available to sender
  ];

  // queries filter
  if (req.query.search) {
    filterConditions.push({
      toEmail: { $regex: req.query.search, $options: "i" },
    });
  }

  if (req.query.status) {
    filterConditions.push({
      status: req.query.status,
    });
  }

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await Invitation.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let invitations = await Invitation.findOne(filterCriteria)
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
    "Get List of Project Invitations successfully"
  );
});

projectController.cancelSingleProjectInvitation = catchAsync(
  async (req, res, next) => {
    // Get data from requests
    const currentUserId = req.userId;
    const { id: projectId, invitationCode } = req.params;

    // Business logic validation
    let invitation = await Invitation.findOne({
      from: currentUserId,
      invitationCode,
      projectId,
      status: "pending",
      isExpired: false,
    });

    if (!invitation)
      throw new AppError(
        401,
        "Invitation Not Found or Unauthorized to Delete Invitation",
        "Cancel Project Invitation Error"
      );

    // Process
    // Soft Delete by expiring the invitation
    invitation.isExpired = true;
    invitation.status = "canceled";
    await invitation.save();

    // Response
    return sendResponse(
      res,
      200,
      true,
      invitation,
      null,
      "Cancel Single Project Invitation successfully"
    );
  }
);

projectController.reactProjectInvitation = catchAsync(
  async (req, res, next) => {
    // Get data from requests
    const currentUserId = req.userId;
    const { id: projectId, invitationCode } = req.params;

    // Business logic validation
    // Current user must have matching email to invitation toEmail
    let currentUser = await User.findOne({
      _id: currentUserId,
      isDeleted: false,
    });

    let invitation = await Invitation.findOne({
      toEmail: currentUser.email,
      invitationCode,
      status: "pending",
      isExpired: false,
    });

    if (!invitation)
      throw new AppError(
        400,
        "Invitation not found or Unauthorized to React to Invitation",
        "React Project Invitation Error"
      );

    let project = await Project.findOne({
      _id: projectId,
      isDeleted: false,
    });

    if (!project)
      throw new AppError(
        400,
        "Project not found",
        "React Project Invitation Error"
      );
    // check if project member already in project
    if (project.projectMembers.includes(currentUserId))
      throw new AppError(
        400,
        "Member already in project",
        "React Project Invitation Error"
      );
    // Process
    const allows = ["status"];
    allows.forEach((field) => {
      if (req.body[field] !== undefined) {
        invitation[field] = req.body[field];
      }
    });

    // if new status === "accepted" => add new project member to projectMembers array
    if (invitation.status === "accepted") {
      project.projectMembers.push(currentUserId);
      await project.save();
      await projectController.calculateProjectInCount(currentUserId);
    }

    // Once success, set invitation to expired
    invitation.isExpired = true;
    await invitation.save();

    // Response
    return sendResponse(
      res,
      200,
      true,
      invitation,
      null,
      "React Project Invitation successfully"
    );
  }
);

projectController.updateManagerRoleOfSingleMember = catchAsync(
  async (req, res, next) => {
    // Get data from requests
    const currentUserId = req.userId;
    const { id: projectId, memberId } = req.params;
    const { isNewManager } = req.body;

    // Business logic validation
    // check project accessibility
    let project = await Project.findOne({
      _id: projectId,
      isDeleted: false,
      projectOwner: currentUserId,
    });

    if (!project)
      throw new AppError(
        401,
        "Cannot Find Project or Unauthorized to See Project",
        "Update Manager Role Of Single Member Error"
      );

    // Check if targeted member is in project
    if (!project.projectMembers.includes(memberId))
      throw new AppError(
        400,
        "Targeted Member Not In Project",
        "Update Manager Role Of Single Member Error"
      );

    // check if targeted user already manager
    isCurrentManager = project.projectManagers.includes(memberId);

    if (isCurrentManager && isNewManager)
      throw new AppError(
        400,
        "Member is already a manager",
        "Update Manager Role Of Single Member Error"
      );

    if (!isCurrentManager && !isNewManager)
      throw new AppError(
        400,
        "Member is already not a manager",
        "Update Manager Role Of Single Member Error"
      );
    // Process
    if (isNewManager) {
      project.projectManagers.push(memberId);
    } else if (!isNewManager) {
      project.projectManagers = project.projectManagers.filter(
        (manager) => !manager.equals(memberId)
      );
    }
    await project.save();
    // console.log(project);
    // Response
    return sendResponse(
      res,
      200,
      true,
      project,
      null,
      "Update Manager Role Of Single Member Error"
    );
  }
);

projectController.removeSingleMemberFromProject = catchAsync(
  async (req, res, next) => {
    // Get data from requests
    const currentUserId = req.userId;
    const { id: projectId, memberId } = req.params;

    // Business logic validation
    // check project accessibility
    let project = await Project.findOne({
      _id: projectId,
      isDeleted: false,
      projectOwner: currentUserId,
    });

    if (!project)
      throw new AppError(
        401,
        "Cannot Find Project or Unauthorized to See Project",
        "Remove Single Member From Project Error"
      );

    // Check if targeted member is in project
    if (!project.projectMembers.includes(memberId))
      throw new AppError(
        400,
        "Targeted Member Not In Project",
        "Remove Single Member From Project Error"
      );
    // Process
    if (project.projectManagers.includes(memberId)) {
      project.projectManagers = project.projectManagers.filter(
        (manager) => !manager.equals(memberId)
      );
    }

    project.projectMembers = project.projectMembers.filter(
      (member) => !member.equals(memberId)
    );

    await project.save();
    await projectController.calculateProjectInCount(memberId);

    // Response
    return sendResponse(
      res,
      200,
      true,
      project,
      null,
      "Remove Single Member From Project Error"
    );
  }
);
module.exports = projectController;
