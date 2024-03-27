const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const checklistItemSchema = Schema(
  {
    checklist: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Checklist",
    },
    itemTitle: { type: String, required: true },
    isChecked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const ChecklistItem = mongoose.model("ChecklistItem", checklistItemSchema);
module.exports = ChecklistItem;
