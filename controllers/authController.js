const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const otpGenerator = require("otp-generator");
const passport = require("passport");

const Store = require("../models/stores");
const Otp = require("../models/otp");
const User = require("../models/UserModel");
const Customer = require("../models/CustomerModel");
const Company = require("../models/CompanyModel");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, aopt } = req.body;

  console.log(req.body);

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).send("User already exists");
    console.log("user with this email already exists");
    return;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: aopt,
  });

  const myOtp = otpGenerator.generate(4, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const otp = await Otp.create({
    user: user.id,
    email,
    otp: myOtp,
  });

  if (user && otp) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: false,
      token: generateToken(user._id, user.role),
    });
  } else {
    res.status(401).send("Error occured while creating account");
  }
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  const userInDb = await User.findOne({ _id: req.user.id });
  const otpInDb = await Otp.findOne({ user: req.user });

  if (userInDb && otpInDb) {
    // compare the otps
    if (otpInDb === otp) {
      // verify the user
      const userVerified = await User.findByIdAndUpdate(
        { _id: req.user.id },
        {
          $set: {
            isVerified: true,
          },
        },
        { new: true }
      );

      if (userVerified) {
        res.status(201).json({
          _id: userVerified._id,
          name: userVerified.name,
          email: userVerified.email,
          isVerified: true,
          token: generateToken(userVerified._id, userVerified.role),
        });
      } else {
        res.status(401).send("Error occured");
      }
    } else {
      res.status(401).send("Wrong Otp");
    }
  }
});

const createCompany = asyncHandler(async (req, res) => {
  const { name, email, category, address, tel, city, poBox } = req.body;

  console.log(req.body);

  const company = await Company.create({
    user: req.user.id,
    name: name,
    email: email,
    category: category,
    address: address,
    tel: tel,
    city: city,
    poBox: poBox,
  });

  const user = await User.findByIdAndUpdate(
    { _id: req.user.id },
    {
      $set: {
        isVerified: true,
      },
    }
  );

  const data = {
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: true,
    token: generateToken(user._id, user.role),
  };

  if (company && user && data) {
    res.status(201).send(data);
  } else {
    res.status(401).send("Error Creating customer");
  }
});

const createCustomer = asyncHandler(async (req, res) => {
  const { name, phone, address, city } = req.body;

  console.log(req.body);

  const customer = await Customer.create({
    user: req.user.id,
    name: name,
    phone: phone,
    address: address,
    city: city,
  });

  const user = await User.findByIdAndUpdate(
    { _id: req.user.id },
    {
      $set: {
        isVerified: true,
      },
    }
  );

  const data = {
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: true,
    token: generateToken(user._id, user.role),
  };

  if (customer && user && data) {
    res.status(201).send(data);
  } else {
    res.status(401).send("Error Creating customer");
  }
});

// Login user
const loginUser = asyncHandler(async (req, res, next) => {
  /* passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) {
      res.status(401).send("Invalid Credentials");
      console.log("user not found in db");
    } else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.json({
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id, user.role),
        });
      });
    }
  })(req, res, next); */

  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("User is not registered !!");
    error.statusCode = 400;
    throw error;
  }

  if (user) {
    const result = await bcrypt.compare(password, user.password);
    if (!result) {
      const error = new Error("Incorrect Password");
      error.statusCode = 403;
      throw error;
    }
    return res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  }
});

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

module.exports = {
  registerUser,
  loginUser,
  createCompany,
  createCustomer,
};
