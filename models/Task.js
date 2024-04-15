const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    effort: { type: Number, default: 0 },
    taskStatus: {
      type: String,
      enum: ["Backlog", "InProgress", "Completed", "Archived"],
      default: "Backlog",
    },
    tags: { type: [{ type: Schema.Types.ObjectId, ref: "Tag" }], default: [] },
    project: { type: Schema.Types.ObjectId, default: null, ref: "Project" },
    assignee: { type: Schema.Types.ObjectId, default: null, ref: "User" },
    startAt: { type: Schema.Types.Date, required: true },
    dueAt: { type: Schema.Types.Date, required: true },

    files: { type: [{ type: String }], default: [] },

    createdBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },

    isDeleted: { type: Boolean, default: false, select: false },
    checklistCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },

    completedAt: { type: Schema.Types.Date, default: null },
  },
  {
    timestamps: true,
  }
);

taskSchema.methods.toJSON = function () {
  const task = this._doc;
  delete task.isDeleted;
  return task;
};

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
