const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  getStaff,
  notifyCustomer,
  dequeueCustomer,
  changePassword,
  updateStaff,
} = require("../controllers/staffController");

/* Customer Routes */
router.get("/get-staff", authMiddleware, getStaff);
router.post("/notify-customer", /* authMiddleware,  */ notifyCustomer);
router.post("/dequeue-customer", authMiddleware, dequeueCustomer);
router.post("/update-staff", authMiddleware, updateStaff);
router.post("/change-password", authMiddleware, changePassword);

module.exports = router;
