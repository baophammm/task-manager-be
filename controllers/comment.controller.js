const mongoose = require("mongoose");
const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");
const { createNewMongoNotification } = require("./notification.controller");

const commentController = {};

const calculateCommentCount = async (targetType, targetId) => {
  const commentCount = await Comment.countDocuments({
    targetType,
    targetId,
  });

  await mongoose
    .model(targetType)
    .findByIdAndUpdate(targetId, { commentCount });
};

commentController.createNewComment = catchAsync(async (req, res, next) => {
  // Get Data from requests
  const currentUserId = req.userId;
  const { content, targetType, targetId } = req.body;

  // followers for sending notifications
  let targetItemFollowerIds = [];

  // Business logic validation

  // check if authorized

  if (targetType === "Project") {
    const project = await Project.find({
      _id: targetId,
      isDeleted: false,
      projectMembers: currentUserId,
    });

    if (!project)
      throw new AppError(
        400,
        "Project not found or unauthorized to view project",
        "Create New Comment Error"
      );

    // add project owner to follower list
    targetItemFollowerIds.push(project.projectOwner.toString());
  }

  if (targetType === "Task") {
    const projects = await Project.find({
      isDeleted: false,
      projectMembers: currentUserId,
    });

    const projectIds = projects.map((project) => project._id);

    const task = await Task.findOne({
      _id: targetId,
      isDeleted: false,
      $or: [
        { project: null, createdBy: currentUserId, assignee: currentUserId }, //personal task without project
        { project: { $in: projectIds } }, //tasks within projects that current user is in
      ],
    });

    if (!task)
      throw new AppError(
        400,
        "Task not found or unauthorized to view task",
        "Create New Comment Error"
      );

    // add assignee to follower list
    targetItemFollowerIds.push(task.assignee.toString());
  }
  // Check targetType exists
  // const targetObj = await mongoose.model(targetType).findById(targetId);

  // if (!targetObj)
  //   throw new AppError(
  //     400,
  //     `${targetType} not found`,
  //     "Create New Comment Error"
  //   );

  // Process
  // Create new comment
  let comment = await Comment.create({
    author: currentUserId,
    targetType,
    targetId,
    content,
  });

  await calculateCommentCount(targetType, targetId);

  // send notification to followers
  // get list of target Item commentators
  const targetItemComments = await Comment.find({
    targetType,
    targetId,
  });

  targetItemComments.map((comment) => {
    const authorId = comment.author.toString();
    if (!targetItemFollowerIds.includes(authorId)) {
      targetItemFollowerIds.push(authorId);
    }
  });

  // targetItemFollowerIds = Array.from(uniqueFollowerIds);

  console.log("Followers", targetItemFollowerIds);
  const currentUser = await User.findById(currentUserId);
  const targetObj = await mongoose.model(targetType).findById(targetId);

  targetItemFollowerIds.map(async (followerId) => {
    if (followerId !== currentUserId) {
      // console.log(followerId);
      // console.log(new mongoose.Types.ObjectId(followerId));
      await createNewMongoNotification({
        title: `New ${targetType} Comment`,
        message: `${currentUser.firstName} ${currentUser.lastName} just commented on ${targetType} ${targetId.title}`,
        // to: new mongoose.Types.ObjectId(followerId),
        to: followerId,
        sendTime: new Date(),
        targetType,
        targetId,
        type: "System",
      });
    }
  });
  // Response
  return sendResponse(
    res,
    200,
    true,
    comment,
    false,
    "Create New Comment successfully"
  );
});

commentController.updateSingleComment = catchAsync(async (req, res, next) => {
  // Get Data from requests
  const currentUserId = req.userId;
  const commentId = req.params.commentId;
  const { content } = req.body;

  // Business logic validation
  // Process
  const comment = await Comment.findOneAndUpdate(
    {
      _id: commentId,
      author: currentUserId,
    },
    { content },
    { new: true }
  );

  if (!comment)
    throw new AppError(
      400,
      "Comment not found or User not authorized",
      "Update Comment Error"
    );

  // Response
  return sendResponse(
    res,
    200,
    true,
    comment,
    null,
    "Update Comment successfully"
  );
});

commentController.deleteSingleComment = catchAsync(async (req, res, next) => {
  // Get Data from requests
  const currentUserId = req.userId;
  const commentId = req.params.commentId;

  // Business logic validation
  // Process
  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    author: currentUserId,
  });

  if (!comment)
    throw new AppError(
      400,
      "Comment not found or User not authorized",
      "Delete Comment Error"
    );

  const targetType = comment.targetType;
  const targetId = comment.targetId;
  await calculateCommentCount(targetType, targetId);

  // Response
  return sendResponse(
    res,
    200,
    true,
    comment,
    null,
    "Delete Comment successfully"
  );
});

commentController.getSingleComment = catchAsync(async (req, res, next) => {
  // Get Data from requests
  const currentUserId = req.userId;
  const commentId = req.params.commentId;

  // Business logic validation
  let comment = await Comment.findById(commentId);
  if (!comment)
    throw new AppError(400, "Comment not found", "Get single comment error");
  // Process

  // Response
  return sendResponse(
    res,
    200,
    true,
    comment,
    null,
    "Get comment successfully"
  );
});

module.exports = commentController;
