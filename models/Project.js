const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    projectStatus: {
      type: String,
      enum: ["Planning", "Ongoing", "Done"],
      default: "Planning",
    },
    projectOwner: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    projectLeads: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    projectMembers: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    startAt: { type: Schema.Types.Date },
    dueAt: { type: Schema.Types.Date },

    isDeleted: { type: Boolean, default: false, select: false },
    taskCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

projectSchema.methods.toJSON = function () {
  const project = this._doc;
  delete project.isDeleted;
  return project;
};

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;
