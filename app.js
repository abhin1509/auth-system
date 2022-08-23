require("dotenv").config();
require("./config/database").connect();

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());

const User = require("./model/user");
const privateKey = process.env.SECRET_KEY;

app.get("/", (req, res) => {
  res.send("<h1>Hello from auth system");
});

app.post("/register", async (req, res) => {
  try {
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

    //generate token
    const token = jwt.sign({ user_id: user._id, email }, privateKey, {
      expiresIn: "2h",
    });
    user.token = token;
    // update or not in db

    //handling password situtation(where we are sending enc password)
    user.password = undefined;
    // we are setting undefined after receiving from db, not that will be undefied

    res.status(201).json(user); // here we are also sending the enc password
  } catch (error) {
    console.log(error);
  }
});

module.exports = app;
