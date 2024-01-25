const { sendResponse } = require("../helpers/utils");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const validators = {};

validators.validate = (validationArray) => async (req, res, next) => {
  await Promise.all(validationArray.map((validation) => validation.run(req)));
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const message = errors
    .array()
    .map((error) => error.msg)
    .join(" & ");

  return sendResponse(res, 422, false, null, { message }, "Validation Error");
};

validators.checkObjectId = (paramId) => {
  if (!mongoose.Types.ObjectId.isValid(paramId)) {
    throw new Error("Invalid ObjectId");
  }
  return true;
};

validators.checkArrayOfString = (array) => {
  if (!array.every((element) => typeof element === "string")) {
    throw new Error("Invalid Data Type In Array, Expecting Strings");
  }

  return true;
};

validators.checkArrayOfObjectId = (array) => {
  array.forEach((elementId) => {
    if (!mongoose.Types.ObjectId.isValid(elementId))
      throw new Error("Invalid Data Type In Array, Expecting ObjectId");
  });

  return true;
};

validators.checkEmail = (email) => {
  const isValid = /\S+@\S+\.\S+/.test(email);
  if (!isValid) throw new Error("Invalid Email");
  return true;
};

validators.checkArrayOfEmail = (array) => {
  const isValid = array.every((email) => /\S+\S+\.\S+/.test(email));
  if (!isValid) throw new Error("Invalid email(s) in the array");

  return true;
};

validators.checkCryptoString = (value) => {
  const cryptoRegex = /^[a-fA-F0-9]{40}$/;
  const isValid = cryptoRegex.test(value);

  if (!isValid) throw new Error("Invalid Encrypted Crypto Code");

  return true;
};

module.exports = validators;
