const jwt = require("jsonwebtoken");

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
  if (req.user && req.user.roles.some((role) => role.name === "admin")) {
    next();
  } else {
    return res.status(403).json({
      errorCode: 403,
      message: "Authorization Failed, Not Admin",
    });
  }
};

module.exports = {
  verifyToken,
  checkUserJWT,
  isAdmin,
};
