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

authController.loginWithGoogle = catchAsync(async (req, res, next) => {
  // Get data from requests
  const {
    email,
    firstName,
    lastName,
    profilePictureUrl,
    isGoogleVerified,
    googleId,
  } = req.body;

  // Business logic validation
  // Process
  const user = await User.findOne({ email });

  // if google verified, login, else return error
  if (!isGoogleVerified)
    throw new AppError(400, "User not yet verified by Google", "Login Error");

  if (user) {
    // check if profilePictureUrl is empty, if yes, replace the google profile picture, else keep the existing profile picture
    if (!user.profilePictureUrl) {
      user.profilePictureUrl = profilePictureUrl;
      await user.save();
    }

    // if no googleId in user, update user with googleId
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    // If user exists, generate token, return user and token
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
  } else {
    // if user does not exists, create user and set user verified to email_verified status, generate token, return user and token
    const newUser = new User({
      email,
      firstName,
      lastName,
      profilePictureUrl,
      googleId,
    });
    await newUser.save();
    const accessToken = await newUser.generateToken();

    // Response
    return sendResponse(
      res,
      200,
      true,
      { user: newUser, accessToken },
      null,
      "Login successfully"
    );
  }
});

module.exports = authController;
