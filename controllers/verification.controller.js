const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const Verification = require("../models/Verification");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const verificationController = {};

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASSWORD, //app password from gmail account
  },
});

const sendMail = async (transporter, mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email has been sent!");
  } catch (error) {
    throw new Error("Send mail error");
  }
};

verificationController.createNewUserVerification = async (
  userId,
  userEmail
) => {
  try {
    await Verification.deleteMany({
      user: userId,
    });

    const verificationCode = crypto.randomBytes(20).toString("hex");

    let verification = await Verification.create({
      user: userId,
      verificationCode,
    });

    // Send email to user's email

    const mailOptions = {
      from: {
        name: "Taskoodle",
        address: process.env.APP_USER,
      }, // sender address
      to: userEmail, // receiver's email
      subject: "Confirm your email with Taskoodle", // Subject line
      text: "abc", // plain text body
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

module.exports = verificationController;
