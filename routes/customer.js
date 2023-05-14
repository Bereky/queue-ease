const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  getCustomer,
  getCompanies,
} = require("../controllers/customerController");

/* Customer Routes */
router.get("/get-customer", authMiddleware, getCustomer);
router.get("/get-companies", authMiddleware, getCompanies);

module.exports = router;
