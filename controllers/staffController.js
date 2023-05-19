const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const uniqId = require("uniqid");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const User = require("../models/UserModel");
const Company = require("../models/CompanyModel");
const Customer = require("../models/CustomerModel");
const Service = require("../models/ServiceModel");
const Staff = require("../models/StaffModel");

const getStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findOne({ user: req.user.id });

  // get service for staff

  // get company for service
  if (staff) {
    const service = await Service.findOne({ _id: staff.service });
    const company = await Company.findOne(staff.company);

    if (service) {
      res.status(200).send({ staff, service, company });
    } else {
      res.status(200).send({ staff, service: null, company });
    }
  } else {
    res.status(400).send("Not Found");
  }
});

const notifyCustomer = asyncHandler(async (req, res) => {
  // desstructure the queue info

  const { queue } = req.body;

  console.log(req.body);

  // send sms to the customer

  client.messages
    .create({
      body: `Hello There`,
      from: "+12543823281",
      to: `+251926706255`,
    })
    .then((message) => console.log("message sent"))
    .catch((err) => console.log(err));

  res.status(200).send("Working");
});

const dequeueCustomer = asyncHandler(async (req, res) => {
  // desstructure the queue info

  const { customerId, queueId } = req.body;

  console.log(req.user, req.body);

  //remove queue from customer
  // company
  // service
  // return updated service

  const staff = await Staff.findOne(req.user._id);

  // update service

  if (staff) {
    const updateService = await Service.findOneAndUpdate(staff._id, {
      $pull: { queue: { queueId: queueId } },
    });

    const updateCustomer = await Customer.findOneAndUpdate(
      {
        customerId,
      },
      {
        $pull: { queues: { queueId: queueId } },
      },
      {
        new: true,
      }
    );

    if (updateCustomer && updateService) {
      res.status(200).send(updateService);
    } else {
      res.status(400).send("Queue Not Found");
    }
  }
});

module.exports = {
  getStaff,
  notifyCustomer,
  dequeueCustomer,
};
