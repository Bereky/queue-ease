const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const uniqId = require("uniqid");

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
    res.status(400).send("Customer Not Found");
  }
});

const getCompanies = asyncHandler(async (req, res) => {
  const company = await Company.find();

  if (company) {
    res.status(200).send(company);
  } else {
    res.status(400).send("Company Not Found");
  }
});

const joinQueue = asyncHandler(async (req, res) => {
  console.log(req.body);

  const queueId = uniqId();

  // update queues in service

  const service = await Service.findOne({ _id: req.body._id });
  const customer = await Customer.findOne({ user: req.user._id });

  const updateService = await Service.findByIdAndUpdate(
    { _id: req.body._id },
    {
      $push: {
        queue: {
          customer: customer,
          queueId: queueId,
          customerId: req.user._id,
          pos: service.currPos,
          joinTime: new Date(),
        },
      },
      $inc: { currPos: 1 },
    }
  );

  // update queue in customer

  const updatedCustomer = await Customer.findOneAndUpdate(
    { user: req.user._id },
    {
      $push: {
        queues: {
          queueId: queueId,
          serviceId: req.body._id,
          service: updateService,
          pos: service.currPos,
          joinTime: new Date(),
        },
      },
    },
    {
      new: true,
    }
  );

  if (updateService && updatedCustomer) {
    //send customer and all companies

    res.status(201).send(updatedCustomer);
  } else {
    res.status(400).send("Error Occured");
  }

  // update in company
});

const leaveQueue = asyncHandler(async (req, res) => {
  const { queueId, serviceId } = req.body;

  const updateService = await Service.findOneAndUpdate(
    { serviceId },
    {
      $pull: {
        queue: {
          serviceId: serviceId,
        },
      },
      $inc: { currPos: -1 },
    }
  );

  // update queue in customer

  const updatedCustomer = await Customer.findOneAndUpdate(
    req.user._id,
    {
      $pull: {
        queues: {
          serviceId: serviceId,
        },
      },
    },
    {
      new: true,
    }
  );

  if (updateService && updatedCustomer) {
    //send customer and all companies

    res.status(201).send(updatedCustomer);
  } else {
    res.status(400).send("Error Occured");
  }

  // update in company
});

/* Profile controllers */

const updateProfile = asyncHandler(async (req, res) => {
  //get the data
  const { name, email } = req.body;

  // update profile

  const updatedProfile = await Customer.findByIdAndUpdate(
    { _id: req.user.id },
    {
      $set: {
        email: email,
        name: name,
      },
    },
    {
      new: true,
    }
  );

  // send the updated data
  if (updatedProfile) {
    res.status(200).send(updatedProfile);
  } else {
    res.status(400).send("Unable to update customer profile");
  }
});

/* Update current user account */
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findOne({ _id: req.user._id });

  // if the user logged in with google
  const comparePassword = await bcrypt.compare(oldPassword, user.password);

  if (comparePassword) {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updateAccount = await User.findByIdAndUpdate(
      { _id: req.user._id },
      {
        $set: {
          password: hashedPassword,
        },
      },
      { new: true }
    );

    if (updateAccount) {
      res.status(201).send("Password Changed Successfully");
    } else {
      res.status(400).send("Error occured");
    }
  } else {
    res.status(400).send("Error occured");
  }
});

module.exports = {
  getCustomer,
  getCompanies,
  joinQueue,
  leaveQueue,
  changePassword,
};
