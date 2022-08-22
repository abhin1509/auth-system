require("dotenv").config();
require("./config/database").connect();

const express = require("express");
const bcrypt = require("bcryptjs");

const app = express();

app.use(express.json());

const User = require("./model/user");

app.get("/", (req, res) => {
  res.send("<h1>Hello from auth system");
});

app.post("/register", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  //validation check using mongoose
  //This is a simple validation check
  if (!(firstname && lastname && email && password)) {
    res.status(400).send("All fields are mandatory");
  }

  const existingUser = await User.findOne({ email }); //PROMISE
  if (existingUser) {
    res.status(401).send("User already exists");
  }

  //take care of password
  const encPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    firstname,
    lastname,
    email: email.toLowerCase(),
    password: encPassword,
  });

  //generate token or send success message
});

module.exports = app;
