const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose
    .connect(process.env.CONNECT_TO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(`Mongodb connected with server: ${data.connection.host}`);
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
};

module.exports = connectDatabase;
