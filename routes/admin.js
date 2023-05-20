const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  getAdmin,
  removeCustomer,
  removeCompany,
  changePassword,
  updateAdmin,
} = require("../controllers/adminController");

/* Customer Routes */
router.get("/get-admin", authMiddleware, getAdmin);
router.post("/remove-customer", authMiddleware, removeCustomer);
router.post("/remove-company", authMiddleware, removeCompany);
router.post("/update-admin", authMiddleware, updateAdmin);
router.post("/change-password", authMiddleware, changePassword);

module.exports = router;
