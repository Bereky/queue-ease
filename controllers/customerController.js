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

const joinQueue = asyncHandler(async (req, res) => {
  console.log(req.body);

  const queueId = uniqId();

  // update queues in service

  const service = await Service.findOne({ _id: req.body._id });

  const updateService = await Service.findByIdAndUpdate(
    { _id: req.body._id },
    {
      $push: {
        queue: {
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
    res.status(401).send("Error Occured");
  }

  // update in company
});

const leaveQueue = asyncHandler(async (req, res) => {
  const { queueId, serviceId } = req.body;

  const updateService = await Service.findByIdAndUpdate(
    { _id: serviceId },
    {
      $pull: {
        queue: {
          queueId: queueId,
        },
      },
      $inc: { currPos: -1 },
    }
  );

  // update queue in customer

  const updatedCustomer = await Customer.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: {
        queues: {
          queueId: queueId,
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
    res.status(401).send("Error Occured");
  }

  // update in company
});

module.exports = {
  getCustomer,
  getCompanies,
  joinQueue,
  leaveQueue,
};
