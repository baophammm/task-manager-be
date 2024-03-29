const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const userSchema = Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    profilePictureUrl: { type: String, default: "" },

    isDeleted: { type: Boolean, default: false, select: false },
    projectOwnCount: { type: Number, default: 0 },
    projectInCount: { type: Number, default: 0 },
    taskCount: { type: Number, default: 0 },

    favoriteProjects: {
      type: [{ type: Schema.Types.ObjectId }],
      default: [],
      ref: "Project",
    },
    active: { type: Boolean, default: false, select: false },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toJSON = function () {
  const user = this._doc;
  delete user.password;
  delete user.isDeleted;
  delete user.active;
  return user;
};

userSchema.methods.generateToken = async function () {
  const accessToken = await jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
  return accessToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
