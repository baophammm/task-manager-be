const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const Notification = require("../models/Notification");
const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Project = require("../models/Project");

const notificationController = {};

notificationController.createNewMongoNotification = async ({
  title,
  message,
  to,
  sendTime,
  targetType,
  targetId,
  type,
}) => {
  try {
    // check if same Notification(s) already exists and delete previous ones
    await Notification.deleteMany({
      title,
      message,
      to,
      targetType,
      targetId,
      type,
    });

    let notification = await Notification.create({
      title,
      message,
      to,
      sendTime,
      targetType,
      targetId,
      type,
    });

    return notification;
  } catch (error) {
    throw new Error("Create New Mongo Notification Error");
  }
};

notificationController.getNotifications = catchAsync(async (req, res, next) => {
  // Get data from requests
  const currentUserId = req.userId;
  let { page, limit, ...filter } = { ...req.query };

  // Business logic validation
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  // check filter input
  const allows = ["isRead", "type", "targetType"];

  const filterKeys = Object.keys(filter);

  filterKeys.map((key) => {
    if (!allows.includes(key))
      throw new AppError(
        400,
        `Key ${key} is not allowed. Reminder: Case sensitivity`,
        "Get List of Notifications Error"
      );
  });

  // Process
  const filterConditions = [
    {
      to: currentUserId,
    },
  ];

  // query filters
  filterKeys.forEach((field) => {
    if (filter[field]) {
      filterConditions.push({ [field]: filter[field] });
    }
  });

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await Notification.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let notifications = await Notification.find(filterCriteria)
    .sort({ sendTime: -1 })
    .skip(offset)
    .limit(limit);

  // Response
  return sendResponse(
    res,
    200,
    true,
    { notifications, totalPages, count },
    null,
    "Get List of Notifications successfully"
  );
});

notificationController.updateSingleNotification = catchAsync(
  async (req, res, next) => {
    // Get data from requests
    const currentUserId = req.userId;
    const notificationId = req.params.notificationId;
    const { isRead } = req.body;

    // Business logic validation
    // check notification to current user
    let notification = await Notification.findOne({
      _id: notificationId,
      to: currentUserId,
    });

    if (!notification)
      throw new AppError(
        401,
        "Cannot find notification or Unauthorized to update notification",
        "Update Single Notification Error"
      );

    // Process
    const allows = ["isRead"];

    allows.forEach((field) => {
      if (req.body[field] !== undefined) {
        notification[field] = req.body[field];
      }
    });

    await notification.save();

    // Response
    return sendResponse(
      res,
      200,
      true,
      notification,
      null,
      "Update Single Notification successfully"
    );
  }
);

notificationController.updateAllNotifications = catchAsync(
  async (req, res, next) => {
    // Get data from requests
    const currentUserId = req.userId;
    let { isRead, page, limit } = req.body;

    // Business logic validation
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    // Process
    let notifications = await Notification.updateMany(
      {
        to: currentUserId,
      },
      {
        isRead,
      }
    );

    const count = await Notification.countDocuments({ to: currentUserId });
    const totalPages = Math.ceil(count / limit);
    const offset = limit * (page - 1);

    notifications = await Notification.find({
      to: currentUserId,
    })
      .sort({ sendTime: -1 })
      .skip(offset)
      .limit(limit);

    // Response
    return sendResponse(
      res,
      200,
      true,
      { notifications, totalPages, count },
      null,
      "Update Multiple Notifications successfully"
    );
  }
);

notificationController.deleteSingleNotification = catchAsync(
  async (req, res, next) => {
    // Get data from requests
    const currentUserId = req.userId;
    const notificationId = req.params.notificationId;

    // Business logic validation
    // Process

    let notification = await Notification.findOneAndDelete({
      _id: notificationId,
      to: currentUserId,
    });

    if (!notification)
      throw new AppError(
        401,
        "Cannot find notification or Unauthorized to delete notification",
        "Delete Single Notification Error"
      );

    // Response
    return sendResponse(
      res,
      200,
      true,
      notification,
      null,
      "Delete Single Notification successfully"
    );
  }
);
module.exports = notificationController;
