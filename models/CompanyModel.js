const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    tel: {
      type: String,
      minLength: 6,
      allowNull: true,
    },
    category: {
      type: String,
      allowNull: true,
    },
    address: {
      type: String,
      minLength: 6,
      allowNull: true,
    },
    city: {
      type: String,
      allowNull: true,
    },
    poBox: {
      type: String,
      allowNull: true,
    },
    services: {
      type: Array,
      required: false,
    },
    image: {
      type: String,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Company", companySchema);
