const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const checklistSchema = Schema(
  {
    checklistTitle: { type: String, required: true },
    task: { type: Schema.Types.ObjectId, required: true, ref: "Task" },
    itemCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Checklist = mongoose.model("Checklist", checklistSchema);
module.exports = Checklist;
