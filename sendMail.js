const nodemailer = require("nodemailer");
require("dotenv").config();
const path = require("path");

console.log(process.env.USER);

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "taskeasify@gmail.com", // Sender Gmail address
    pass: process.env.APP_PASSWORD, //app password from gmail account
  },
});

const mailOptions = {
  from: {
    name: "Task Easify",
    address: "taskeasify@gmail.com",
  }, // sender address
  to: "baophamgiale@gmail.com", // receiver's email(s)
  subject: "Confirm your email with Task Easify", // Subject line
  text: "abc", // plain text body
  html: `
  <p>Welcome to Task Easify! Click on this <a href="/">LINK</a> to verify your email.</p>
      <p>Thank you!</p>
      `, // html body
};

const sendMail = async (transporter, mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email has been sent!");
  } catch (error) {
    console.log(error);
  }
};

sendMail(transporter, mailOptions);
