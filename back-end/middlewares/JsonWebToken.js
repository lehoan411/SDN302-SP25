const jwt = require("jsonwebtoken");

const createJWT = (payload = {}) => {
  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 60 * 60 * 24 });
    return token;
  } catch (error) {
    console.log(error);
  }
};

const verifyToken = (token) => {
  try {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (err) {
      // err
    }
  } catch (error) {
    console.log(error);
  }
};

const checkUserJWT = (req, res, next) => {
  const cookie = req.cookies;
  if (cookie) {
    const token = cookie.jwt;
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
      req.token = token;
      next();
    } else {
      return res.status(403).json({
        errorCode: 403,
        message: "Authorization Failed",
      });
    }
  } else {
    return res.status(403).json({
      errorCode: 401,
      message: "Authorization Failed",
    });
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
  createJWT,
  verifyToken,
  checkUserJWT,
  isAdmin,
};
