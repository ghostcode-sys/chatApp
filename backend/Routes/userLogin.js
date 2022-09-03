const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const data = require("../keys.json");
const { USER } = require("../Model/index");
const router = express.Router();

const getEmail = (token) => {
  return jwt.verify(token, data.jwtkey);
};

const verifyToken = (req, res, next) => {
  // console.log(req.headers)
  const token = req.headers["authorization"];
  token.trim();
  if (token == "Bearer") {
    next();
  } else {
    const bearer = token.split(" ");
    const email = jwt.verify(bearer[1], data.jwtkey);
    req.token = email;
    next();
  }
};

router.post("/signIn", async (req, res) => {
  try {
    const body = req.body;
    const user = USER(body);
    const val = await user.save();
    const token = jwt.sign(val.email, data.jwtkey);
    res.status(200).json({ token });
  } catch (error) {
    if (error.code == 11000) {
      res.status(403).send("email already exists");
    } else {
      res.status(403).send("error");
    }
  }
});

router.post("/logIn", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await USER.findOne({ email });

    const isCorrect = bcrypt.compare(password, user.password);
    if (isCorrect) {
      const token = jwt.sign(user.email, data.jwtkey);
      res.status(200).json({ token, username: user.name, friends:user.connections});
    } else {
      res.status(400).send("wrong password");
    }
  } catch (error) {
    res.status(400).send("Email or password is wrong");
  }
});

router.get("/logInToken", verifyToken, async (req, res) => {
  try {
    if (req.token) {
      const user = await USER.findOne({ email: req.token });
      if (user) {
        res.status(200).json({ username:user.name });
      } else {
        res.status(400).send("No user found with the token");
      }
    }
  } catch (error) {
    res.status(403).send("data not found");
  }
});

router.post("/addUser", verifyToken, async (req, res) => {
  try {
    if (req.token) {
      const user = await USER.findOne({ email: req.token });
      if (user) {
        if(! user.connections.includes(req.body.friend)){
        user.connections.push(req.body.friend);
        await user.save();
        const otherEmail = getEmail(req.body.friend);
        otherUser = await USER.findOne({ email: otherEmail });
        const token = req.headers["authorization"];
        const bearer = token.split(" ");
        otherUser.connections.push(bearer[1]);
        otherUser.save();
        }
        res.status(200).send("User list updated");
      } else {
        res.status(400).send("Error Occured");
      }
    }
  } catch (error) {
    res.status(400).send("Error Occured");
  }
});

router.get("/getFriends", verifyToken, async (req, res) => {
  try {
    if (req.token) {
      const user = await USER.findOne({ email: req.token });
      if (user) {
        res.status(200).json(user.connections);
      } else {
        res.status(400).send("Error Occured");
      }
    }
  } catch (error) {
    res.status(400).send("Error Occured");
  }
});

router.get("/allUsers", verifyToken, async (req, res) => {
  try {
    if (req.token) {
      const user = await USER.findOne({ email: req.token });
      if (user) {
        const allUser = await USER.find();
        if (allUser) {
          const sendUser = allUser.map((ele) => {
            return {
              username: ele.name,
              token: jwt.sign(ele.email, data.jwtkey),
            };
          });
          res.status(200).json({ sendUser });
        }
      } else {
        res.status(400).send("Error Occured");
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("Error Occured");
  }
});

module.exports = router;
