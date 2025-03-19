const jwt = require("jsonwebtoken");
const User = require("../models/user");
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const checkUserJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Lấy token từ Header Authorization

  if (!token) {
    return res.status(401).json({ errorCode: 401, message: "Authorization Failed: No Token Provided" });
  }

  const decoded = verifyToken(token);

  if (decoded) {
    req.user = decoded; // Gán thông tin user vào request
    next();
  } else {
    return res.status(403).json({ errorCode: 403, message: "Authorization Failed: Invalid Token" });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.roles) {
    return res.status(403).json({
      errorCode: 403,
      message: "Authorization Failed: User roles missing",
    });
  }

  if (req.user.roles === "admin") {
    return next();
  } else {
    return res.status(403).json({
      errorCode: 403,
      message: "Authorization Failed: Not Admin",
    });
  }
};

const isActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id); // Tìm user trong database

    if (!user) {
      return res.status(404).json({ errorCode: 404, message: "User not found" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ errorCode: 403, message: "Your account is inactive" });
    }

    next(); // Nếu user có trạng thái active thì tiếp tục request
  } catch (error) {
    return res.status(500).json({ errorCode: 500, message: "Internal Server Error" });
  }
};

module.exports = {
  verifyToken,
  checkUserJWT,
  isAdmin,
  isActive,
};
