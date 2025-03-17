  const express = require("express");
  const bodyParser = require("body-parser");
  const bcrypt = require("bcryptjs");
  const jwt = require("jsonwebtoken");
  const User = require("../models/user");

  const AuthRouter = express.Router();
  AuthRouter.use(bodyParser.json());

  AuthRouter.post("/sign-up", async (req, res) => {
    try {
      const { name, email, password, confirmPassword, bio, avatar, dob } = req.body;

      // Kiểm tra đầu vào
      if (!name || !email || !password || !confirmPassword) {
        return res.status(422).json({ status: 422, message: "Missing parameter(s)" });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ status: 400, message: "Passwords do not match" });
      }

      // Kiểm tra xem email đã tồn tại chưa
      const existingUser = await User.findOne({ email }).select("email");
      if (existingUser) {
        return res.status(409).json({ status: 409, message: "This Email is already used." });
      }

      // Mã hóa mật khẩu
      const hashPassword = bcrypt.hashSync(password, parseInt(process.env.PASSWORD_HASH_KEY));

      // Tạo người dùng mới
      const newUser = new User({
        name,
        email,
        password: hashPassword,
        roles: "user", // Mặc định là user
        bio: bio || "",
        avatar: avatar || "",
        dob: dob || null,
        status: "active", // Mặc định là active
        albums: [],
        favorited: [],
      });

      await newUser.save();

      return res.status(201).json({
        status: 201,
        message: "Registered successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
  });

  AuthRouter.post("/sign-in", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(422).json({ status: 422, message: "Missing input(s)" });
      }

      const existUser = await User.findOne({ email });
      if (!existUser) {
        return res.status(401).json({ message: "Email or password is incorrect" });
      }

      const isCorrectPassword = bcrypt.compareSync(password, existUser.password);
      if (!isCorrectPassword) {
        return res.status(401).json({ message: "Email or password is incorrect" });
      }

      if (existUser.status !== "active") {
        return res.status(403).json({ message: "Your account is inactive. Please contact support." });
      }

      // 🔥 Token chỉ chứa userId
      const token = jwt.sign({ userId: existUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

      return res.status(200).json({
        status: 200,
        message: "Authenticated successfully!",
        token, // Token này sẽ được lưu vào localStorage trên frontend
        user: {
          name: existUser.name,
          email: existUser.email,
          roles: existUser.roles,
          avatar: existUser.avatar,
        },
      });

    } catch (error) {
      console.error("Sign-in Error:", error);
      return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
  });


  module.exports = AuthRouter;