var jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  try {
    // Skip token verification for login and register routes
    if (
      req.url.toString().includes("login") ||
      req.url.toString().includes("register")
    ) {
      return next();
    }

    // For all other routes, verify token
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: true,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: true,
        message: "Invalid token format",
      });
    }

    const decoded = jwt.verify(token, process.env.secret);
    req.userId = decoded.id;
    req.userRole = decoded.role; // attach role if present
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({
      error: true,
      message: "Unauthorized",
      details: err.message,
    });
  }
}

module.exports = { authMiddleware };
