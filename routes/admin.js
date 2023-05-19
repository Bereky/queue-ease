const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  getAdmin,
  removeCustomer,
  removeCompany,
} = require("../controllers/adminController");

/* Customer Routes */
router.get("/get-admin", authMiddleware, getAdmin);
router.post("/remove-customer", authMiddleware, removeCustomer);
router.post("/remove-company", authMiddleware, removeCompany);

module.exports = router;
