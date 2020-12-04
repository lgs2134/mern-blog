import express from "express";
import bcypt, { hashSync } from "bcryptjs";

import jwt from "jsonwebtoken";
import config from "../../config/index";
const { JWT_SECRET } = config;

//model
import User from "../../models/user";
import { Error } from "mongoose";

const router = express.Router();

//@routes get api/user
//@desc get all user
//@access public
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    if (!users) throw Error("No Users");
    res.status(200).json(users);
  } catch (e) {
    console.log(e);
    res.status(400).json({ msg: e.message });
  }
});

//@routes post api/user
//@desc register user
//@access public
router.post("/", async (req, res) => {
  console.log(req.body);
  const { name, email, password } = req.body;

  //simple validation
  if (!name || !email || !password) {
    return res.status(400).json({ msg: "모든 필드를 채워주세요." });
  }

  //check fro exising user
  User.findOne({ email }).then((user) => {
    if (user)
      return res.status(400).json({ msg: "이미 가입된 유저가 존재합니다." });
    const newUser = new User({
      name,
      email,
      password,
    });
    bcypt.genSalt(10, (err, salt) => {
      bcypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser.save().then((user) => {
          jwt.sign(
            { id: user.id },
            JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
              if (err) throw err;
              res.json({
                token,
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                },
              });
            }
          );
        });
      });
    });
  });
});

export default router;
