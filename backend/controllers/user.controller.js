import bcrypt from "bcrypt";

import { TokenAndCookie } from "../config/jwt.config.js";
import User from "../models/user.model.js";
import redisClient from "../config/redis.db.js";

export const register = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ code: 0, message: "please provide email and password" });
    }
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ code: 0, message: "email already exists" });
    }
    const hash = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hash });
    await newUser.save();
    const newUserSend = await User.findById(newUser._id).select("-password");
    const token = TokenAndCookie(newUser._id, res);
    res.status(201).json({
      code: 1,
      message: "user registered successfully",
      user: newUserSend,
      token,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 0, message: "error in register controller" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ code: 0, message: "please provide email and password" });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(401)
        .json({ code: 0, message: "invalid email or password" });
    }
    if (!user.password) {
      console.error("User password is missing from the database");
      return res
        .status(500)
        .json({
          code: 0,
          message: "User password is missing from the database",
        });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ code: 0, message: "invalid email or password" });
    }
    const token = TokenAndCookie(user._id, res);
    res.status(200).json({
      code: 1,
      message: "user logged in successfully",
      user: {
        _id: user._id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 0, message: "error in login controller" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ code: 1, message: "user logged out successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 0, message: "error in logout controller" });
  }
};

export const getUser = async (req, res) => {
  const id = req.user._id;

  try {
    const cachedUser = await new Promise((resolve, reject) => {
      redisClient.get(`user:${id}`, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });

    if (cachedUser) {
      console.log("Cache hit");
      return res.status(200).json({ user: JSON.parse(cachedUser) });
    }

    console.log("Cache miss");
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ code: 0, message: "User not found" });
    }

    await new Promise((resolve, reject) => {
      redisClient.set(
        `user:${id}`,
        JSON.stringify({
          _id: user._id,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }),
        "EX",
        60 * 60,
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });

    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ code: 0, message: "Error in getUser controller" });
  }
};

export const getAllUsers = async(req,res)=>{
  const id = req.user._id;
  try {
    const users = await User.find({_id: {$ne: id}}).select("-password");
    return res.json({users});
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 0, message: "Error in getAllUsers controller" });
  }
}