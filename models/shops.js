const mongoose = require("mongoose");
const schema = mongoose.Schema;

const shop = new schema({
  name: {
    type: String,
    required: true,
  },
  Address: {
    type: String,
    required: true,
  },
  opentime: {
    type: String,
  },
  closetime: {
    type: String,
  },
  long: {
    type: Number,
  },
  latti: {
    type: Number,
  },
  counter: {
    type: Number,
    required: true,
  },
  ShopCounter: {
    type: Array,
  },
  countertime: {
    type: Array,
  },
  avgtime: {
    type: Array,
  },
  queue: {
    type: Array,
    require: true,
  },
});
module.exports = mongoose.model("shop", shop);
