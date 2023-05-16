const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      minLength: 6,
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
    queues: {
      type: Array,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Customer", customerSchema);
