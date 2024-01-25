const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invitationSchema = Schema(
  {
    from: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    toEmail: { type: String, required: true },
    projectId: { type: String, required: true, ref: "Project" },
    invitationCode: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "canceled"],
      default: "pending",
    },
    isExpired: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const Invitation = mongoose.model("Invitation", invitationSchema);
module.exports = Invitation;
