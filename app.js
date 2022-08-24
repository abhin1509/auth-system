require("dotenv").config();
require("./config/database").connect();

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const isloggedIn = require("./middleware/auth");

const app = express();

app.use(express.json());
app.use(cookieParser());

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
    // update or not in db - choice

    //handling password situtation(where we are sending enc password)
    user.password = undefined;
    // we are setting undefined after receiving from db

    //send token if you want to start app just after reg or send success and redirect - choice
    res.status(201).json(user); // Now password will be undefiened
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("All fields are mandatory");
    }

    const user = await User.findOne({ email });

    // if(!user) {  // prevent sending pass in user.password from mongoose
    //   res.status(400).send("You are not registered");
    // }

    const passMatched = await bcrypt.compare(password, user.password);

    if (user && passMatched) {
      const token = jwt.sign({ user_id: user._id }, privateKey, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined;
      // return res.status(200).json(user);

      // If we want to send token in cookie instead of json
      const millisecondsInThreeDays = 3 * 24 * 60 * 60 * 1000;
      const options = {
        expires: new Date(Date.now() + millisecondsInThreeDays),
        httpOnly: true,
      };
      return res
        .status(200)
        .cookie("token", token, options)
        .json({ success: true, user });
      //TODO: expiration of cookies and tokens
    }
    res.status(400).send("email or password is incorrect");
  } catch (error) {
    console.log(error);
  }
});

app.get("/dashboard", isloggedIn, (req, res) => {
  res.status(200).send("welcome to dashboard");
});

module.exports = app;
