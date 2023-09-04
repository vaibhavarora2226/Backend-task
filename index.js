const express = require("express");
const mongoose = require("mongoose");
const app = express();
const userDb = require("./user");
const passport = require("passport");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const http = require("http");
const { Server } = require("socket.io");

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
let socketId;
io.on("connection", (socket) => {
  socketId = socket.id;
  console.log("this is socket ");
});

httpServer.listen(8000, () => {
  console.log("socket is connected");
});

require("./passport")(passport);

mongoose
  .connect("mongodb+srv://vaibhav:vaibhav1234@cluster0.xfaokel.mongodb.net/")
  .then(async () => {
    console.log("connected to mongodb");
  })
  .catch((error) => console.error(error));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.post("/", (req, res, next) => {
  req.status(200).send("hello");
  console.log("hello");
});

app.post("/login", async (req, res, next) => {
  try {
    const { password, username } = req.body;
    const existingUser = await userDb.findOne({ username }).lean();
    if (!existingUser) {
      return res.status(401).json({ error: "User does not exist" });
    }
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (isMatch) {
      const payload = {
        ...existingUser,
      };
      jwt.sign(
        payload,
        "qwertyuiopqwertyuiopqwertyuiopqwertyuiop",
        { expiresIn: 7 * 24 * 3600 },
        async (err, token) => {
          if (err) console.error({ error: "There is some error in token" });
          else {
            res.json({
              success: true,
              token: `Bearer ${token}`,
            });
          }
        }
      );

      io.to(socketId).emit("notification", payload);
      return res.status(200).json({ sucess: "Logged In" });
      console.log(socketId);
    } else {
      return res.status(401).json({ error: "Incorrect Password" });
    }
  } catch (error) {
    return res.status(401).json({ error: "Something Went Wrong" });
  }
});

app.post("/signup", async (req, res, next) => {
  try {
    const { email, password, username, phonenumber } = req.body;
    const existingUser = await userDb
      .findOne({ username, email, phonenumber })
      .lean();
    if (existingUser) {
      res.status(400).send({ error: "User already exists" });
    }
    bcrypt.genSalt(saltRounds, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        if (err) throw err;
        const payload = {
          email,
          password: hash,
          username,
          phonenumber,
        };

        const newUser = await userDb.create({ ...payload });
        console.log(newUser);
        res.status(200).send({ sucess: "Sucessfully created " });
      });
    });
  } catch (error) {
    return res.status(401).json({ error: "Something Went Wrong" });
  }
});

app.listen(5000, () => console.log(`localhost at : ${5000}`));
