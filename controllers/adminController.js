const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const uniqId = require("uniqid");

const User = require("../models/UserModel");
const Company = require("../models/CompanyModel");
const Customer = require("../models/CustomerModel");
const Staff = require("../models/StaffModel");
const Service = require("../models/ServiceModel");

const getAdmin = asyncHandler(async (req, res) => {
  const admin = await User.findOne({ _id: req.user.id });
  const companies = await Company.find();
  const customers = await Customer.find();

  if (admin && companies && customers) {
    res.status(200).send({ admin, companies, customers });
  } else {
    res.status(400).send("User Not Found");
  }
});

// remove customer

const removeCustomer = asyncHandler(async (req, res) => {
  const { _id, user } = req.body;

  // from services of each queue
  const customer = await Customer.findById(_id);

  if (customer) {
    // remove from every service
    for (const queue of customer.queues) {
      const service = await Service.findById(queue.serviceId);
      const updatedServices = service.queue.filter(
        (q) => q.queueId !== queue.queueId
      );
      service.queue = updatedServices;
      await service.save();
    }
    // remove customer from customer model
    const removeCust = await Customer.findByIdAndDelete(_id);

    const removeCustUser = await User.findByIdAndDelete(user);

    if (removeCustUser && removeCust) {
      const customers = await Customer.find();

      res.status(200).send(customers);
    }
  } else {
    res.status(400).send("Error while deleting");
  }
});

const removeCompany = asyncHandler(async (req, res) => {
  // remove every service
  // remove queue of customer in each service from customer

  const company = req.body;
  //
  // Remove queues related to the company from customer
  const removeFromCustomer = await Customer.updateMany(
    {
      "queues.service": { $in: company.services.map((service) => service._id) },
    },
    {
      $pull: {
        queues: {
          service: { $in: company.services.map((service) => service._id) },
        },
      },
    }
  );

  const staffToDelete = await Staff.find({ company: company._id }).exec();
  const deletedStaffs = await Staff.deleteMany({ company: company._id });
  const staffIds = staffToDelete.map((staff) => staff.user);
  const deleteStaffsFromUser = await User.deleteMany({
    _id: { $in: staffIds },
  });

  if (
    removeFromCustomer &&
    deletedStaffs &&
    staffIds &&
    deleteStaffsFromUser &&
    deletedStaffs
  ) {
    // Remove company and services related to the company
    const removeServices = await Service.deleteMany({ company: company._id });
    const removeStaffs = await Staff.deleteMany({ company: company._id });
    const removeFromCompany = await Company.findByIdAndDelete(company._id);
    const removeCompanyFromUser = await User.findByIdAndDelete(company.user);

    if (
      removeServices &&
      removeFromCompany &&
      removeStaffs &&
      removeCompanyFromUser
    ) {
      const companies = await Company.find();

      res.status(200).send(companies);
    }
  } else {
    res.status(400).send("Error");
  }
});

/* Profile controllers */

const updateAdmin = asyncHandler(async (req, res) => {
  //get the data
  const { email } = req.body;

  console.log(req.body);

  // update profile

  const updatedProfile = await User.findOneAndUpdate(
    { user: req.user.id },
    {
      $set: {
        email: email,
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
    res.status(400).send("Unable to update profile");
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
  getAdmin,
  removeCustomer,
  removeCompany,
  updateAdmin,
  changePassword,
};
