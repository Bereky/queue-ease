const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const connectToDB = require("./config/database");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const path = require("path");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const companyRoutes = require("./routes/company");
const customerRoutes = require("./routes/customer");
const staffRoutes = require("./routes/staff");
const storeroutes = require("./routes/store");

const PORT = process.env.PORT || 8200;

const app = express();
connectToDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "build")));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
}); */

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/staff", staffRoutes);
app.use("/store", storeroutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});  

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.listen(PORT, () => console.log("Server connected on PORT:", PORT));
