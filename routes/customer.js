const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  getCustomer,
  getCompanies,
  joinQueue,
  leaveQueue,
  changePassword,
} = require("../controllers/customerController");

/* Customer Routes */
router.get("/get-customer", authMiddleware, getCustomer);
router.get("/get-companies", authMiddleware, getCompanies);

router.post("/join-queue", authMiddleware, joinQueue);
router.post("/leave-queue", authMiddleware, leaveQueue);
router.post("/change-password", authMiddleware, changePassword);

/* profile end points */
//router.post("/update-profile", authMiddleware, updateProfile);
//router.post("/change-password", authMiddleware, changePassword);
//router.post("/close-account", authMiddleware, closeAccount);

module.exports = router;
