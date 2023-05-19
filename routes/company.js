const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  getCompany,
  addStaff,
  addService,
  updateStaff,
  removeStaff,
  updateService,
  removeService,
  uploadImage,
  changePassword,
} = require("../controllers/companyController");
const { upload } = require("../middlewares/uploadMiddleware");

/* Company routes */
router.get("/get-company", authMiddleware, getCompany);
router.post("/add-staff", authMiddleware, addStaff);
router.post("/update-staff", authMiddleware, updateStaff);
router.post("/remove-staff", authMiddleware, removeStaff);

router.post("/add-service", authMiddleware, addService);
router.post("/update-service", authMiddleware, updateService);
router.post("/remove-service", authMiddleware, removeService);
router.post(
  "/upload-image",
  authMiddleware,
  upload.single("image"),
  uploadImage
);

router.post("/change-password", authMiddleware, changePassword);

module.exports = router;
