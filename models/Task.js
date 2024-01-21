const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    taskStatus: {
      type: String,
      enum: [
        "Backlog",
        "Pending",
        "InProgress",
        "Completed",
        "Reviewed",
        "Archived",
      ],
      default: "Backlog",
    },
    priority: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      default: "High",
    },

    assignee: { type: Schema.Types.ObjectId, ref: "User" },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    startAt: { type: Schema.Types.Date },
    dueAt: { type: Schema.Types.Date },

    files: { type: [{ type: String }], default: [] },

    createdBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },

    isDeleted: { type: Boolean, default: false, select: false },
    commentCount: { type: Number, default: 0 },
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
