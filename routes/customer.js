const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  getCustomer,
  getCompanies,
  joinQueue,
  leaveQueue,
  changePassword,
  updateCustomer,
  getServces,
} = require("../controllers/customerController");

/* Customer Routes */
router.get("/get-customer", authMiddleware, getCustomer);
router.get("/get-companies", authMiddleware, getCompanies);
router.get("/get-services", authMiddleware, getServces);

router.post("/join-queue", authMiddleware, joinQueue);
router.post("/leave-queue", authMiddleware, leaveQueue);
router.post("/update-customer", authMiddleware, updateCustomer);
router.post("/change-password", authMiddleware, changePassword);

/* profile end points */
//router.post("/update-profile", authMiddleware, updateProfile);
//router.post("/change-password", authMiddleware, changePassword);
//router.post("/close-account", authMiddleware, closeAccount);

module.exports = router;
