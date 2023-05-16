const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { getStaff } = require("../controllers/staffController");

/* Customer Routes */
router.get("/get-staff", authMiddleware, getStaff);

module.exports = router;
