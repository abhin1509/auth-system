const jwt = require("jsonwebtoken");
const privateKey = process.env.SECRET_KEY;

// model is optional

const isloggedIn = (req, res, next) => {
  // get the token from wherever it is coming - req.cookies.token ||req.body.token;
  const token =
    req.cookies.token ||
    req.body.token ||
    req.header("Authorization").replace("Bearer ", "");

  if (!token) {
    return res.status(403).send("token is missing");
  }

  try {
    const decode = jwt.verify(token, privateKey);
    console.log(decode);
    req.user = decode; //(optional) or get info from db then add that to req.user
  } catch (error) {
    res.status(401).send("invalid token");
  }
  return next();
};

module.exports = isloggedIn;
