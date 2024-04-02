const Tag = require("../models/Tag");
const { AppError } = require("../helpers/utils");

const tagMiddlewares = {};

tagMiddlewares.validateTagColor = async (req, res, next) => {
  try {
    const currentUserId = req.userId;
    const tagId = req.params.tagId;

    const { color, colorShade } = req.body;

    let projectId = req.body.projectId;

    if (tagId) {
      const tag = await Tag.findById(tagId);
      projectId = tag.project;
    }

    if (projectId) {
      // check project tags
      const tags = await Tag.find({ project: projectId });
      console.log(tags);
      // get list of current tags set of color and color shade
      const currentColorSetList = tags.map((tag) => ({
        color: tag.color,
        colorShade: tag.colorShade,
      }));

      // check if the new tag color and color shade already exists in the project
      currentColorSetList.forEach((colorSet) => {
        if (colorSet.color === color && colorSet.colorShade === colorShade) {
          throw new AppError(
            400,
            "Tag color and color shade already exists in this project",
            "New Tag Color Error"
          );
        }
      });
    } else {
      // check pesonal tags
      const tags = await Tag.find({ project: null, createdBy: currentUserId });
      console.log(tags);
      // get list of current tags set of color and color shade
      const currentColorSetList = tags.map((tag) => ({
        color: tag.color,
        colorShade: tag.colorShade,
      }));

      // check if the new tag color and color shade already exists in the project
      currentColorSetList.forEach((colorSet) => {
        if (colorSet.color === color && colorSet.colorShade === colorShade) {
          throw new AppError(
            400,
            "Tag color and color shade already exists",
            "New Tag Color Error"
          );
        }
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

tagMiddlewares.checkTagUpdateAccess = async (req, res, next) => {
  try {
    const currentUserId = req.userId;
    const tagId = req.params.tagId;

    const tag = await Tag.findById(tagId);

    if (!tag) {
      throw new AppError(400, "Tag not found", "Update Tag Error");
    }

    // Only allow tag creator to update / delete tag
    if (!tag.createdBy.equals(currentUserId)) {
      throw new AppError(
        400,
        "Unauthorized to update / delete tag",
        "Tag Error"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = tagMiddlewares;
