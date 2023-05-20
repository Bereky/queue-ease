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
    res.status(400).send("Company Not Found");
  }
});

/* Profile controllers */

const updateCompany = asyncHandler(async (req, res) => {
  //get the data
  const { name, email, address, phoneNumber } = req.body;

  console.log(req.body);

  // update profile

  const updatedProfile = await Company.findOneAndUpdate(
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
      res.status(400).send("Error while creating staff");
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
  const { name, type, staff, waitTime, workTime, fee, limit, status } =
    req.body;

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
      status,
    });

    const newService = {
      serviceId: service._id,
    };

    const serviceInCompany = await Company.findByIdAndUpdate(
      { _id: company._id },
      {
        $push: { services: newService },
      }
    );

    const assignServiceToStaff = await Staff.findByIdAndUpdate(
      {
        _id: staff,
      },
      {
        $set: { service: service._id },
      }
    );

    if (service && serviceInCompany && assignServiceToStaff) {
      const allServices = await Service.find({ company: company._id });
      const staff = await Staff.find({ company: company._id });

      if (allServices) {
        res.status(201).send({ allServices, staff });
      } else {
        res.status(400).send("Error occured");
      }
    } else {
      res.status(400).send("Error occured");
    }
  } else {
    res.status(400).send("Error occured");
  }
});

const updateService = asyncHandler(async (req, res) => {
  const { id, company, name, staff, fee, waitTime, limit, type, status } =
    req.body;

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
        status: status,
      },
    }
  );

  const myCompany = await Company.findOne({ _id: company });

  const companyUpdate = await Company.updateOne(
    {
      company,
      services: { $elemMatch: { _id: id } },
    },
    {
      $set: {
        "services.$.name": name,
        "services.$.type": type,
        "services.$.waitTime": waitTime,
        "services.$.fee": fee,
        "services.$.limit": limit,
        "services.$.staff": staff,
        "services.$.status": status,
      },
    },
    {
      new: true,
    }
  );

  console.log(companyUpdate);

  if (serviceUpdate && companyUpdate) {
    const service = await Service.find({ company: company });
    res.status(200).send(service);
  } else {
    res.status(400).send("error while trying");
  }
});

const removeService = asyncHandler(async (req, res) => {
  const { _id, company } = req.body;

  console.log(req.body);

  // check if there are customers in queue and allow delete

  const service = await Service.findOne({ _id: _id });

  console.log(service);

  if (service.queue.length > 0) {
    res.status(400).send("Cant delete service there are customers in queue");
    return;
  }

  const removedService = await Service.findByIdAndDelete({ _id: _id });

  // remove staff assign
  const updateStaff = await Staff.findOneAndUpdate(
    { service: _id },
    {
      $set: { service: null },
    }
  );

  const removedServiceFromCompany = await Company.findOneAndUpdate(
    company,
    {
      $pull: { services: { serviceId: _id } },
    },
    {
      new: true,
    }
  );

  //console.log(removedServiceFromCompany);

  if (removedService && removedServiceFromCompany && updateStaff) {
    const service = await Service.find({ company: company });

    res.status(200).send(service);
  } else {
    res.status(400).send("error while trying to remove");
  }
});

const uploadImage = asyncHandler(async (req, res) => {
  const uploaded = await Company.findOneAndUpdate(
    { user: req.user.id },
    {
      $set: {
        image: req.file ? req.file.filename : null,
      },
    }
  );

  if (uploaded) {
    const company = await Company.find({ user: req.user.id });

    res.status(200).send(company[0]);
  } else {
    res.status(400).send("Error Uploading image");
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
  getCompany,
  updateCompany,
  addStaff,
  updateStaff,
  removeStaff,
  addService,
  updateService,
  removeService,
  uploadImage,
  changePassword,
};
