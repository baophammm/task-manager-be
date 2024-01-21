const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    to: [{ type: Schema.Types.ObjectId, required: true, ref: "User" }],
    sendTime: { type: Schema.Types.Date, required: true },
    targetType: { type: String, enum: ["Task", "Project"], required: true },
    targetID: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
    },
    isRead: { type: Boolean, default: false },
    type: { type: String, enum: ["system", "user"], required: true },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
