const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  getCustomer,
  getCompanies,
  joinQueue,
  leaveQueue,
} = require("../controllers/customerController");

/* Customer Routes */
router.get("/get-customer", authMiddleware, getCustomer);
router.get("/get-companies", authMiddleware, getCompanies);

router.post("/join-queue", authMiddleware, joinQueue);
router.post("/leave-queue", authMiddleware, leaveQueue);

module.exports = router;
