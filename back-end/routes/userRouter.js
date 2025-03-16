const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const db = require("../models/index");
const jwt = require("jsonwebtoken");

const userRouter = express.Router();
userRouter.use(bodyParser.json());

const getRoles = async (roleName) => {
  let role = await db.role.findOne({ name: roleName }).select("_id");
  if (!role) {
    role = await db.role.create({ name: roleName });
  }
  return role;
};
userRouter.post("/sign-up", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Kiểm tra các tham số đầu vào
    if (!name || !email || !password || !confirmPassword) {
      return res.status(422).json({ status: 422, message: "Missing parameter(s)" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ status: 400, message: "Invalid confirm password" });
    }

    // Kiểm tra xem email đã tồn tại chưa
    const user = await db.user.findOne({ email }).select("email");
    if (user) {
      return res.status(409).json({ status: 409, message: "This Email is already used." });
    }

    // Mã hóa mật khẩu & tạo token kích hoạt
    const token = uuidv4();
    const hashPassword = bcrypt.hashSync(password, parseInt(process.env.PASSWORD_HASH_KEY));
    const roles = await getRoles("member");

    // Tạo người dùng mới
    await db.user.create({
      name,
      email,
      password: hashPassword,
      roles: [roles._id],
      token,
      isActived: false,
    });



    return res.status(201).json({
      status: 201,
      message: "Registered successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});



userRouter.post("/sign-in", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({ status: 422, message: "Missing input(s)" });
    }

    const existUser = await db.user.findOne({ email }).populate("roles");
    if (!existUser) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const isCorrectPassword = bcrypt.compareSync(password, existUser.password);
    if (!isCorrectPassword) {
      return res.status(401).json({ message: "Wrong email or password" });
    }

    // Tạo token JWT
    const payload = {
      _id: existUser._id,
      name: existUser.name,
      email: existUser.email,
      roles: existUser.roles,
      avatar: existUser.avatar,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false,   // Để false trên localhost, true nếu chạy HTTPS
      sameSite: "Lax", // Nếu backend & frontend KHÁC DOMAIN, đổi thành "None"
      maxAge: 24 * 60 * 60 * 1000, // 1 ngày
    });
    
    return res.status(200).json({
      status: 200,
      message: "Authenticated successfully!",
      data: payload,
      token,
    });

  } catch (error) {
    console.error("Sign-in Error:", error);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});


// Các route khác (có thể mở lại khi cần)

// userRouter.get("/logout", async (req, res) => {
//   res.status(501).json({ message: "Not implemented" });
// });
// userRouter.get("/:userId", async (req, res) => {
//   res.status(501).json({ message: "Not implemented" });
// });
// userRouter.get("/", async (req, res) => {
//   res.status(501).json({ message: "Not implemented" });
// });
// userRouter.patch("/:id", async (req, res) => {
//   res.status(501).json({ message: "Not implemented" });
// });
// userRouter.post("/active-account", async (req, res) => {
//   res.status(501).json({ message: "Not implemented" });
// });

module.exports = userRouter; // Xuất trực tiếp thay vì object
