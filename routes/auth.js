const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  createCustomer,
  createCompany,
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/create-customer", authMiddleware, createCustomer);
router.post("/create-company", authMiddleware, createCompany);

module.exports = router;
