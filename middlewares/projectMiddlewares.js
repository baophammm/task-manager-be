const Project = require("../models/Project");
const { AppError } = require("../helpers/utils");

const projectMiddlewares = {};

projectMiddlewares.checkProjectAccess = async (req, res, next) => {
  try {
    const currentUserId = req.userId;

    // check projectId input from multiple request sources
    const projectId = req.params.projectId
      ? req.params.projectId
      : req.body.projectId
      ? req.body.projectId
      : req.query.projectId;

    if (projectId) {
      const project = await Project.findOne({
        _id: projectId,
        isDeleted: false,
        projectMembers: currentUserId,
      });

      if (!project) {
        throw new AppError(
          400,
          "Project not found or unauthorized to view project",
          "Project Error"
        );
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

projectMiddlewares.checkProjectOwnerUpdateAccess = async (req, res, next) => {
  try {
    const currentUserId = req.userId;
    const projectId = req.params.projectId
      ? req.params.projectId
      : req.body.projectId
      ? req.body.projectId
      : req.query.projectId;

    if (projectId) {
      //TODO
      // check this is a leaving project request. If so, allow the request
      // check req method to determine if it is a delete request
      if (req.method === "DELETE") {
        const memberId = req.params.memberId;
        if (memberId && memberId === currentUserId) {
          return next();
        }
      }

      const project = await Project.findOne({
        _id: projectId,
        isDeleted: false,
        projectOwner: currentUserId,
      });

      if (!project) {
        throw new AppError(
          400,
          "Project not found or unauthorized to update / delete project",
          "Project Error"
        );
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

projectMiddlewares.checkProjectLeadUpdateAccess = async (req, res, next) => {
  try {
    const currentUserId = req.userId;
    const projectId = req.params.projectId
      ? req.params.projectId
      : req.body.projectId
      ? req.body.projectId
      : req.query.projectId;
    if (projectId) {
      const project = await Project.findOne({
        _id: projectId,
        isDeleted: false,
        $or: [{ projectOwner: currentUserId }, { projectLeads: currentUserId }],
      });

      if (!project) {
        throw new AppError(
          400,
          "Project not found or unauthorized to update task features in this project",
          "Project Error"
        );
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = projectMiddlewares;
