const Member = require("../models/Member");

// middleware generator to require one of given roles
function requireRole(roles) {
  return async (req, res, next) => {
    try {
      // role may be attached already by authMiddleware
      let role = req.userRole;
      if (!role) {
        const user = await Member.findById(req.userId);
        role = user?.role;
        req.userRole = role;
      }
      if (!role || !roles.includes(role)) {
        return res.status(403).json({
          error: true,
          message: "Forbidden: insufficient permissions",
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { requireRole };
