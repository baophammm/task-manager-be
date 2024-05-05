const nodemailerOrigin = require("nodemailer");

const nodemailer = {};

nodemailer.transporter = nodemailerOrigin.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASSWORD, //app password from gmail account
  },
});

nodemailer.sendMail = async (transporter, mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email has been sent!");
  } catch (error) {
    throw new Error("Send mail error");
  }
};

module.exports = nodemailer;
