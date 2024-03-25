const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subTaskSchema = Schema(
  {
    task: { type: Schema.Types.ObjectId, required: true, ref: "Task" },
    subTaskText: { type: String, required: true },
    isChecked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const SubTask = mongoose.model("SubTask", subTaskSchema);
module.exports = SubTask;
