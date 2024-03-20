const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const authController = {};

authController.loginWithEmail = catchAsync(async (req, res, next) => {
  // Get data from requests
  const { email, password } = req.body;

  // Business logic validation
  const user = await User.findOne(
    { email, active: true, isDeleted: false },
    "+password"
  );
  if (!user)
    throw new AppError(
      400,
      "Invalid Credentials or User not yet verified",
      "Login Error"
    );

  // Process
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError(400, "Wrong password", "Login Error");

  const accessToken = await user.generateToken();

  // Response
  return sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Login successfully"
  );
});

module.exports = authController;
