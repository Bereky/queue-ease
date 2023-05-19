const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Math.round(Math.random() * 10);
    cb(null, uniqueSuffix + file.originalname);
  },
});

const upload = multer({ storage: storage });

module.exports = {
  upload,
};
