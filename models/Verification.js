const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const verificationSchema = Schema(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    verificationCode: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Verification = mongoose.model("Verification", verificationSchema);
module.exports = Verification;
