require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.json());

const User = require("./model/user");

app.get("/", (req, res) => {
  res.send("<h1>Hello from auth system");
});

app.post("/register", (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  //validation check using mongoose 
  //This is a simple validation check
  if (!(firstname && lastname && email && password)) {
    res.status(400).send("All fields are mandatory");
  }

  const existingUser = User.findOne({ email });
  if(existingUser) {
    res.status(401).send("User already exists");
  }

  //take care of password
  //generate token or send success message
});

module.exports = app;
