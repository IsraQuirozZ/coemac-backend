const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      const error = new Error("No token provided");
      error.statusCode = 401;
      throw error;
    }

    if (!authHeader.startsWith("Bearer ")) {
      const error = new Error("Invalid token format");
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    error.statusCode = 401;
    next(error);
  }
};

module.exports = {
  protect,
};
