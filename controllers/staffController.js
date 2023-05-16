const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const uniqId = require("uniqid");

const User = require("../models/UserModel");
const Company = require("../models/CompanyModel");
const Customer = require("../models/CustomerModel");
const Service = require("../models/ServiceModel");
const Staff = require("../models/StaffModel");

const getStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findOne({ user: req.user.id });

  if (staff) {
    res.status(200).send(staff);
  } else {
    res.status(401).send("Staff Not Found");
  }
});

module.exports = {
  getStaff,
};
