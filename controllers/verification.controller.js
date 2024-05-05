const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const Verification = require("../models/Verification");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const verificationController = {};
const { transporter, sendMail } = require("../helpers/nodemailer");

verificationController.createNewUserVerification = async (
  userId,
  userEmail
) => {
  try {
    await Verification.deleteMany({
      user: userId,
      verificationType: "NewUser",
    });

    const verificationCode = crypto.randomBytes(20).toString("hex");

    let verification = await Verification.create({
      user: userId,
      verificationCode,
      verificationType: "NewUser",
    });

    // Send email to user's email

    const mailOptions = {
      from: {
        name: "Taskoodle",
        address: process.env.APP_USER,
      }, // sender address
      to: userEmail, // receiver's email
      subject: "Confirm your email with Taskoodle", // Subject line
      text: "Welcome to Taskoodle! Click on this LINK to verify your email", // plain text body
      html: `<p>Welcome to Taskoodle! Click on this <a href="${process.env.FRONT_END_PORT}/verifications/${verificationCode}">LINK</a> to verify your email.</p>
      <p>Thank you!</p>`, // html body
    };

    sendMail(transporter, mailOptions);
  } catch (error) {
    throw new Error("Create New User Verification Error");
  }
};

verificationController.verifyNewUser = catchAsync(async (req, res, next) => {
  // Get data from requests
  const verificationCode = req.params.verificationCode;

  // Business logic validation
  const verification = await Verification.findOne({
    verificationCode,
    verificationType: "NewUser",
  });

  if (!verification)
    throw new AppError(
      400,
      "Verification not found",
      "Verifying New User error"
    );
  const targetUserId = verification.user;
  const user = await User.findOneAndUpdate(
    {
      _id: targetUserId,
      isDeleted: false,
      active: false,
    },
    {
      active: true,
    },
    { new: true }
  );

  if (!user)
    throw new AppError(
      400,
      "User not found or already verified",
      "Verifying New User error"
    );
  // Process
  const accessToken = await user.generateToken();

  await Verification.findOneAndDelete({
    verificationCode,
  });

  // Response
  return sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Verifying New User successfully"
  );
});

verificationController.requestPasswordReset = catchAsync(
  async (req, res, next) => {
    // Get data from requests
    const { email } = req.body;

    // Business logic validation
    // check user exists
    const user = await User.findOne({
      email,
      isDeleted: false,
      active: true,
    });

    if (!user)
      throw new AppError(400, "User not found", "Request Reset Password error");

    // Process
    const verificationCode = crypto.randomBytes(20).toString("hex");
    const resetPasswordToken = await user.generateResetPasswordToken(
      verificationCode
    );

    await Verification.deleteMany({
      user: user._id,
      verificationType: "ResetPassword",
    });

    await Verification.create({
      user: user._id,
      verificationCode,
      verificationType: "ResetPassword",
    });

    // Send email to user's email
    const mailOptions = {
      from: {
        name: "Taskoodle",
        address: process.env.APP_USER,
      }, // sender address
      to: email, // receiver's email
      subject: "Reset your password with Taskoodle", // Subject line
      text: "Click on this LINK to reset your password", // plain text body
      html: `<p>Click on this <a href="${process.env.FRONT_END_PORT}/resetPassword?verificationCode=${verificationCode}&token=${resetPasswordToken}">LINK</a> to reset your password.</p>
      <p>Thank you!</p>`, // html body
    };

    sendMail(transporter, mailOptions);

    // Response
    return sendResponse(
      res,
      200,
      true,
      null,
      null,
      "Request Reset Password successfully"
    );
  }
);

module.exports = verificationController;
