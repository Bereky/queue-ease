const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Company",
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      allowNull: true,
    },
    waitTime: {
      type: String,
      required: true,
    },
    limit: {
      type: String,
      required: true,
    },
    fee: {
      type: String,
      required: true,
    },
    queue: {
      type: Array,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Service", serviceSchema);
