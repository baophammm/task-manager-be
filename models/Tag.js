const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tagSchema = Schema(
  {
    tagLabel: { type: String, required: true },
    color: {
      type: String,
      enum: ["red", "yellow", "orange", "blue", "green", "purple"],
      required: true,
    },
    colorShade: {
      type: String,
      enum: ["dark", "main", "light"],
      required: true,
    },
    project: { type: Schema.Types.ObjectId, default: null, ref: "Project" },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const Tag = mongoose.model("Tag", tagSchema);
module.exports = Tag;
