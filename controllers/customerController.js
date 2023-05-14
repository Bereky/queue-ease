const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("../models/UserModel");
const Company = require("../models/CompanyModel");
const Customer = require("../models/CustomerModel");
const Staff = require("../models/StaffModel");
const Service = require("../models/ServiceModel");

const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ user: req.user.id });

  if (customer) {
    res.status(200).send(customer);
  } else {
    res.status(401).send("Customer Not Found");
  }
});

const getCompanies = asyncHandler(async (req, res) => {
  const company = await Company.find();

  if (company) {
    res.status(200).send(company);
  } else {
    res.status(401).send("Company Not Found");
  }
});

module.exports = {
  getCustomer,
  getCompanies,
};
