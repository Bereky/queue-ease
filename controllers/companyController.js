const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("../models/UserModel");
const Company = require("../models/CompanyModel");
const Staff = require("../models/StaffModel");
const Service = require("../models/ServiceModel");

const getCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ user: req.user.id });

  if (company) {
    const staff = await Staff.find({ company: company._id });
    const services = await Service.find({ company: company._id });

    res.status(200).send({ company, staff, services });
  } else {
    res.status(401).send("Company Not Found");
  }
});

//add staff

const addStaff = asyncHandler(async (req, res) => {
  const { name, email, password, address, phone } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).send("User already exists");
    console.log("staff with this email already exists");
    return;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const company = await Company.findOne({ user: req.user.id });

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "staff",
  });

  if (user && company) {
    // Create staff
    const staff = await Staff.create({
      user: user._id,
      company: company._id,
      name,
      email,
      address,
      phone,
      service: null,
    });

    const allStaffs = await Staff.find({ company: company._id });

    if (staff && allStaffs) {
      res.status(201).send(allStaffs);
    } else {
      res.status(401).send("Error while creating staff");
    }
  }
});

const updateStaff = asyncHandler(async (req, res) => {
  console.log(req.body);

  const { id, user, company, name, email, phone, address } = req.body;

  const updatedStaff = await Staff.findByIdAndUpdate(
    { _id: id },
    {
      $set: {
        name: name,
        email: email,
        phone: phone,
        address: address,
      },
    }
  );
  const updateUser = await User.findByIdAndUpdate(
    { _id: user },
    {
      $set: {
        name: name,
        email: email,
      },
    }
  );

  if (updatedStaff && updateUser) {
    const staff = await Staff.find({ company: company });
    res.status(200).send(staff);
  } else {
    res.status(400).send("error while trying to remove");
  }
});

const removeStaff = asyncHandler(async (req, res) => {
  console.log(req.body);

  const { _id, user, company } = req.body;

  const removedStaff = await Staff.findByIdAndDelete({ _id: _id });
  const removeUser = await User.findByIdAndDelete({ _id: user });

  if (removedStaff && removeUser) {
    const staff = await Staff.find({ company: company });

    res.status(200).send(staff);
  } else {
    res.status(400).send("error while trying to remove");
  }
});

const addService = asyncHandler(async (req, res) => {
  const { name, type, staff, waitTime, workTime, fee, limit } = req.body;

  // addd service
  // update staff as assigned
  // add queue field in service

  const company = await Company.findOne({ user: req.user.id });

  if (company) {
    const service = await Service.create({
      staff,
      company: company._id,
      name,
      type,
      waitTime,
      limit,
      fee,
      currPos: 1,
    });

    const serviceInCompany = await Company.findByIdAndUpdate(
      { _id: company._id },
      {
        $push: { services: service },
      }
    );

    const assignServiceToStaff = await Staff.findByIdAndUpdat(
      {
        _id: staff,
      },
      {
        $set: { service: service._id },
      }
    );

    if (service && serviceInCompany && assignServiceToStaff) {
      const allServices = await Service.find({ company: company._id });

      if (allServices) {
        res.status(201).send(allServices);
      } else {
        res.status(401).send("Error occured");
      }
    } else {
      res.status(401).send("Error occured");
    }
  } else {
    res.status(401).send("Error occured");
  }
});

const updateService = asyncHandler(async (req, res) => {
  console.log(req.body);

  const { id, company, name, staff, fee, waitTime, limit, type } = req.body;

  const serviceUpdate = await Service.findByIdAndUpdate(
    { _id: id, company: company },
    {
      $set: {
        name: name,
        type: type,
        waitTime: waitTime,
        fee: fee,
        limit: limit,
        staff: staff,
      },
    }
  );

  if (serviceUpdate) {
    const service = await Service.find({ company: company });
    res.status(200).send(service);
  } else {
    res.status(400).send("error while trying");
  }
});

const removeService = asyncHandler(async (req, res) => {
  const { _id, company } = req.body;

  const removedService = await Service.findByIdAndDelete({ _id: _id });
  const removedServiceFromCompany = await Company.findByIdAndUpdate(
    { _id: company },
    {
      $pull: { services: { _id: 1234 } },
    },
    {
      new: true,
    }
  );

  console.log(removedServiceFromCompany);

  if (removedService && removedServiceFromCompany) {
    const service = await Service.find({ company: company });

    res.status(200).send(service);
  } else {
    res.status(400).send("error while trying to remove");
  }
});

module.exports = {
  getCompany,
  addStaff,
  updateStaff,
  removeStaff,
  addService,
  updateService,
  removeService,
};
