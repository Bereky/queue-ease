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

// GET SERVS
const getServces = asyncHandler(async (req, res) => {
  const service = await Service.find();

  if (service) {
    res.status(200).send(service);
  } else {
    res.status(400).send("service Not Found");
  }
});

const joinQueue = asyncHandler(async (req, res) => {
  console.log(req.body);

  const queueId = uniqId();

  const service = await Service.find({ _id: req.body._id });

  console.log(service);
  // check if the que limit is reached and allow join
  if (service && service[0].limit === service[0].queue.length + 1) {
    res.status.send("Queue is full");
    return;
  }

  // update queues in service

  const customer = await Customer.findOne({ user: req.user._id });

  const updateService = await Service.findByIdAndUpdate(
    { _id: req.body._id },
    {
      $push: {
        queue: {
          customer: customer,
          queueId: queueId,
          customerId: req.user._id,
          pos: service[0].currPos,
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

  const upCustomer = await Customer.findOne(req.user._id);

  if (updateService && updatedCustomer && upCustomer) {
    //send customer and all companies

    res.status(201).send(updatedCustomer);
  } else {
    res.status(400).send("Error Occured");
  }

  // update in company
});

const makeAppointment = asyncHandler(async (req, res) => {
  const { service, data } = req.body;
  const queueId = uniqId();

  const serviceData = await Service.findOne({ _id: service._id });

  console.log(serviceData);
  // check if the que limit is reached and allow join

  const customer = await Customer.findOne({ user: req.user._id });

  if (serviceData && customer) {
    const updateService = await Service.findByIdAndUpdate(
      { _id: service._id },
      {
        $push: {
          queue: {
            appt: {
              date: data.date,
              time: data.time,
            },
            customer: customer,
            queueId: queueId,
            customerId: req.user._id,
            pos: serviceData.currPos > 1 ? serviceData.currPos : 1,
            joinTime: new Date(),
          },
        },
        $inc: { currPos: 1 },
      }
    );

    // update customer
    const updatedCustomer = await Customer.findOneAndUpdate(
      req.user._id,
      {
        $push: {
          queues: {
            service: updateService,
            serviceId: service._id,
            appt: {
              date: data.date,
              time: data.time,
            },
            pos: serviceData.currPos - 1,
          },
        },
      },
      {
        new: true,
      }
    );

    const upCustomer = await Customer.findOne(req.user._id);

    if (updateService && updatedCustomer && upCustomer) {
      //send customer and all companies

      res.status(201).send(upCustomer);
    } else {
      res.status(400).send("Error Occured");
    }
  } else {
    res.status(400).send("Error Occured");
  }
});

const leaveQueue = asyncHandler(async (req, res) => {
  const { queueId, serviceId } = req.body.queue;
  const { _id } = req.body.service;

  const updateService = await Service.findByIdAndUpdate(
    { _id: _id },
    {
      $pull: {
        queue: {
          serviceId: _id,
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

  console.log("service", updateService);

  const upCustomer = await Customer.findOne(req.user._id);

  if (updateService && updatedCustomer && upCustomer) {
    //send customer and all companies

    res.status(201).send(upCustomer);
  } else {
    res.status(400).send("Error Occured");
  }

  // update in company
});

/* Profile controllers */

const updateCustomer = asyncHandler(async (req, res) => {
  //get the data
  const { name, email, address, phoneNumber } = req.body;

  console.log(req.body);

  // update profile

  const updatedProfile = await Customer.findOneAndUpdate(
    { user: req.user.id },
    {
      $set: {
        email: email,
        name: name,
        address: address,
        phone: phoneNumber,
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
  getServces,
  joinQueue,
  makeAppointment,
  leaveQueue,
  updateCustomer,
  changePassword,
};
