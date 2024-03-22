const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");
const bcrypt = require("bcryptjs");
const Invitation = require("../models/Invitation");
const Verification = require("../models/Verification");

const { createNewUserVerification } = require("./verification.controller");
// const verificationController = require("./verification.controller");

const userController = {};
userController.register = catchAsync(async (req, res, next) => {
  // Get data from requests
  let { firstName, lastName, email, password } = req.body;

  // Business logic Validation
  // Check if user already in DB
  let user = await User.findOne({ email }, "+isDeleted +active");

  if (user && user.active && !user.isDeleted)
    throw new AppError(400, "User already exists", "User Registration Error");

  // Process
  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);

  // If user already exists but previously deleted => overwrite
  if (user && user.isDeleted) {
    user = await User.findOneAndUpdate(
      { email, isDeleted: true },
      {
        firstName,
        lastName,
        password,
        isDeleted: false,
      },
      { new: true }
    );
  }
  // If no user at all => create new
  if (!user) {
    user = await User.create({ firstName, lastName, email, password });
  }

  // const accessToken = await user.generateToken();
  // testing createNewUserVerification

  await createNewUserVerification(user._id, email);

  // Response
  return sendResponse(
    res,
    200,
    true,
    { user },
    null,
    "Created User successfully"
  );
});
userController.getUsers = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  let { page, limit, ...filter } = { ...req.query };

  // Business logic Validation
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const allows = ["search"];
  const filterKeys = Object.keys(filter);

  filterKeys.map((key) => {
    if (!allows.includes(key))
      throw new AppError(
        400,
        `Key ${key} is not allowed`,
        "Get List of Users Error"
      );
  });
  // Process
  const filterConditions = [
    {
      isDeleted: false,
    },
  ];

  // filter queries
  if (filter.search) {
    filterConditions.push({
      $or: [
        { firstName: { $regex: filter.search, $options: "i" } },
        { lastName: { $regex: filter.search, $options: "i" } },
        { email: { $regex: filter.search, $options: "i" } }, // add email
      ],
    });
  }

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await User.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let users = await User.find(filterCriteria)
    .sort({ lastName: 1 })
    .skip(offset)
    .limit(limit);

  // Response
  return sendResponse(
    res,
    200,
    true,
    { users, totalPages, count },
    null,
    "Get List of Users successfully"
  );
});

userController.getCurrentUser = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  // Business logic Validation
  const user = await User.findOne({ _id: currentUserId, isDeleted: false });
  if (!user)
    throw new AppError(400, "User not found", "Get Current User Error");
  // Process
  // Response
  return sendResponse(
    res,
    200,
    true,
    user,
    null,
    "Get Current User successfully"
  );
});
userController.getSingleUser = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  const userId = req.params.id;

  // Business logic Validation
  const filterConditions = [
    { _id: userId },
    {
      isDeleted: false,
    },
  ];

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  let user = await User.findOne(filterCriteria);
  if (!user) throw new AppError(400, "User not found", "Get Single User Error");

  // Process
  // Response
  return sendResponse(
    res,
    200,
    true,
    user,
    null,
    "Get Single User successfully"
  );
});
userController.updateProfile = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  const userId = req.params.id;
  // Business logic Validation
  let user = await User.findOne({ _id: userId, isDeleted: false }, "+password");
  if (!user)
    throw new AppError(400, "User not found", "Update User Profile Error");

  if (currentUserId !== userId)
    throw new AppError(400, "Permission required", "Update User Profile Error");

  // Process
  const allows = ["firstName", "lastName", "profilePictureUrl"];

  for (const field of allows) {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  }
  await user.save();

  // Response
  return sendResponse(
    res,
    200,
    true,
    user,
    null,
    "Update User Profile successfully"
  );
});
userController.deleteUser = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  const userId = req.params.id;
  // Business logic Validation
  let user = await User.findOne({ _id: userId, isDeleted: false }, "+password");
  if (!user)
    throw new AppError(400, "User not found", "Delete User Profile Error");

  if (currentUserId !== userId)
    throw new AppError(400, "Permission required", "Delete User Profile Error");

  // Process
  // Soft Delete a user
  user.isDeleted = true;
  user.active = false;
  await user.save();

  // Remove user from all projects and tasks
  // Response
  return sendResponse(
    res,
    200,
    true,
    user,
    null,
    "Delete User Profile successfully"
  );
});
// userController.getCurrentUserProjects = catchAsync(async (req, res, next) => {
//   // Get data from requests
//   const currentUserId = req.userId;
//   let { page, limit, ...filter } = { ...req.query };

//   // Business logic validation
//   page = parseInt(page) || 1;
//   limit = parseInt(limit) || 10;

//   // check filter input
//   const allows = [
//     "search",
//     "currentUserRole",
//     "projectStatus",
//     "startAfter",
//     "startBefore",
//     "dueAfter",
//     "dueBefore",
//   ];

//   const filterKeys = Object.keys(filter);

//   filterKeys.forEach((key) => {
//     if (!allows.includes(key))
//       throw new AppError(
//         400,
//         `Key ${key} is not allowed. Reminder: Case sensitivity`,
//         "Get Current User List of Projects Error"
//       );
//   });

//   // Process
//   const filterConditions = [
//     { isDeleted: false },
//     {
//       $or: [{ projectOwner: currentUserId }, { projectMembers: currentUserId }], // only projects that current user owns or is a member in
//     },
//   ];

//   // query filters
//   filterKeys.forEach((field) => {
//     if (filter[field]) {
//       const condition = (() => {
//         switch (field) {
//           case "search":
//             return {
//               $or: [
//                 { title: { $regex: filter[field], $options: "i" } },
//                 { description: { $regex: filter[field], $options: "i" } },
//               ],
//             };
//           case "currentUserRole":
//             if (filter[field] === "Owner") {
//               return { projectOwner: currentUserId };
//             } else if (filter[field] === "Lead") {
//               return { projectLeads: currentUserId };
//             } else if (filter[field] === "Member") {
//               return {
//                 $and: [
//                   { projectMembers: currentUserId },
//                   { projectLeads: { $ne: currentUserId } },
//                 ],
//               };
//             }
//           case "startAfter":
//             return { startAt: { $gte: filter[field] } };
//           case "startBefore":
//             return { startAt: { $lte: filter[field] } };
//           case "dueAfter":
//             return { dueAt: { $gte: filter[field] } };
//           case "dueBefore":
//             return { dueAt: { $lte: filter[field] } };
//           default:
//             return { [field]: filter[field] };
//         }
//       })();
//       filterConditions.push(condition);
//     }
//   });

//   const filterCriteria = filterConditions.length
//     ? { $and: filterConditions }
//     : {};

//   const count = await Project.countDocuments(filterCriteria);
//   const totalPages = Math.ceil(count / limit);
//   const offset = limit * (page - 1);

//   let projects = await Project.find(filterCriteria)
//     .sort({ createdAt: -1 })
//     .skip(offset)
//     .limit(limit);

//   // Response
//   return sendResponse(
//     res,
//     200,
//     true,
//     { projects, totalPages, count },
//     null,
//     "Get Current User List of Projects successfully"
//   );
// });

userController.addProjectToUserFavorite = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  const userId = req.params.id;
  const projectId = req.body.projectId;

  // Business logic validation
  const targetUser = await User.findOne({
    _id: userId,
    isDeleted: false,
  });

  if (!targetUser)
    throw new AppError(
      400,
      "User not found",
      "Add Project to User Favorite Error"
    );

  if (currentUserId !== userId)
    throw new AppError(
      401,
      "Unauthorized to add favorite project to this user",
      "Add Project To User Favorite Error"
    );

  // Check if user is in selected project
  const project = await Project.findOne({
    _id: projectId,
    isDeleted: false,
    projectMembers: userId,
  });

  if (!project)
    throw new AppError(
      400,
      "Project not found",
      "Add Project To User Favorite Error"
    );

  // Check if project is already favorite
  if (targetUser.favoriteProjects.includes(projectId))
    throw new AppError(
      400,
      "Project is already User's favorite",
      "Add Project To User Favorite Error"
    );

  // Process
  targetUser.favoriteProjects.unshift(projectId);
  await targetUser.save();

  // Response
  return sendResponse(
    res,
    200,
    true,
    targetUser,
    null,
    "Add Project To User Favorite successfully"
  );
});
userController.getUserFavoriteProjects = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  let userId = req.params.id;
  let { page, limit, ...filter } = { ...req.query };
  // Business logic validation
  const targetUser = await User.findOne({
    _id: userId,
    isDeleted: false,
  });

  if (!targetUser)
    throw new AppError(
      400,
      "User not found",
      "Get User Favorite Projects Error"
    );

  if (currentUserId !== userId)
    throw new AppError(
      400,
      "Cannot see other users' favorite projects",
      "Get User Favorite Projects Error"
    );

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  // check filter input
  const allows = [
    "search",
    "currentUserRole",
    "projectStatus",
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
        "Get User Favorite Projects Error"
      );
  });

  // Process
  const filterConditions = [
    { isDeleted: false },
    { _id: { $in: targetUser.favoriteProjects } }, // only projects that are users favorite
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
          case "currentUserRole":
            if (filter[field] === "Owner") {
              return { projectOwner: currentUserId };
            } else if (filter[field] === "Lead") {
              return { projectLeads: currentUserId };
            } else if (filter[field] === "Member") {
              return {
                $and: [
                  { projectMembers: currentUserId },
                  { projectLeads: { $ne: currentUserId } },
                ],
              };
            }
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

  const count = await Project.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let projects = await Project.find(filterCriteria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("projectOwner");

  // Response
  return sendResponse(
    res,
    200,
    true,
    { projects, totalPages, count },
    null,
    "Get User Favorite Projects successfully"
  );
});

userController.removeProjectFromUserFavorite = catchAsync(
  async (req, res, next) => {
    // Get data from requests
    const currentUserId = req.userId;
    const userId = req.params.id;
    const projectId = req.params.projectId;

    // Business logic validation
    const targetUser = await User.findOne({
      _id: userId,
      isDeleted: false,
    });

    if (!targetUser)
      throw new AppError(
        400,
        "User not found",
        "Remove Project From User's Favorite Error"
      );

    if (currentUserId !== userId)
      throw new AppError(
        401,
        "Unauthorized to remove project from this User",
        "Remove Project From User's Favorite Error"
      );

    const project = await Project.findOne({
      _id: projectId,
      isDeleted: false,
    });

    if (!project)
      throw new AppError(
        400,
        "Project not found",
        "Remove Project From User's Favorite Error"
      );

    if (!targetUser.favoriteProjects.includes(projectId))
      throw new AppError(
        400,
        "Project is not User's favorite",
        "Remove Project From User's Favorite Error"
      );

    // Process

    targetUser.favoriteProjects = targetUser.favoriteProjects.filter(
      (project) => !project.equals(projectId)
    );

    console.log(targetUser);

    await targetUser.save();

    // Response
    return sendResponse(
      res,
      200,
      true,
      targetUser,
      null,
      "Remove Project From Users's Favorite successfully"
    );
  }
);
userController.getCurrentUserTasks = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  let { page, limit, ...filter } = { ...req.query };

  // Business logic validation
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  // check filter input
  const allows = [
    "search",
    "taskStatus",
    "projectId",
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
        "Get Current User List of Tasks Error"
      );
  });

  // Process
  const filterConditions = [
    { assignee: currentUserId }, //tasks assigned to current user
    { isDeleted: false },
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

  const count = await Task.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const tasks = await Task.find(filterCriteria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  // Response
  return sendResponse(
    res,
    200,
    true,
    { tasks, totalPages, count },
    null,
    "Get Current User List of Tasks successfully"
  );
});
module.exports = userController;
