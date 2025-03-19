const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const db = require("../models/index");

const AuthRouter = express.Router();
AuthRouter.use(bodyParser.json());

// Đăng ký tài khoản
AuthRouter.post("/sign-up", async (req, res) => {
  try {
    const { name, email, password, confirmPassword, roles } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(422).json({ status: 422, message: "Missing parameter(s)" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ status: 400, message: "Invalid confirm password" });
    }

    const existingUser = await db.user.findOne({ email }).select("email");
    if (existingUser) {
      return res.status(409).json({ status: 409, message: "This Email is already used." });
    }

    const token = uuidv4();
    const hashPassword = bcrypt.hashSync(password, parseInt(process.env.PASSWORD_HASH_KEY));

    // Kiểm tra role hợp lệ
    const validRoles = ["user", "admin", "user Vip"];
    const assignedRole = validRoles.includes(roles) ? roles : "user"; // Mặc định là "user"

    // Tạo user mới
    const newUser = new db.user({
      name,
      email,
      avatar: "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_960_720.png",
      password: hashPassword,
      roles: assignedRole,
      token,
      status: "inactive", // Mặc định chưa kích hoạt
    });

    await newUser.save();

    return res.status(201).json({ status: 201, message: "Registered successfully" });
  } catch (error) {
    console.error("Sign-up Error:", error);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

// Đăng nhập
AuthRouter.post("/sign-in", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({ status: 422, message: "Missing input(s)" });
    }

    const existUser = await db.user.findOne({ email });
    if (!existUser) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const isCorrectPassword = bcrypt.compareSync(password, existUser.password);
    if (!isCorrectPassword) {
      return res.status(401).json({ message: "Wrong email or password" });
    }

    const token = jwt.sign({ userId: existUser._id, roles: existUser.roles }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({
      status: 200,
      message: "Authenticated successfully!",
      token,
    });

  } catch (error) {
    console.error("Sign-in Error:", error);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

module.exports = AuthRouter;
