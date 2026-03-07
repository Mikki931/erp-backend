const express = require("express");
const { authMiddleware } = require("../middleware/authmiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  loginMember,
  registerMember,
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember,
} = require("../controllers/memberController");

const routerMember = express.Router();

// Public routes (no auth required)
routerMember.post("/login", loginMember);

// registration is open to anyone; controller decides what role to assign
// (admins can include a role in the body, ordinary sign‑ups become "sales").
routerMember.post("/register", registerMember);

// Protected routes (auth required)
routerMember.use(authMiddleware);

routerMember.get("/", requireRole(["admin"]), getAllMembers);
routerMember.get("/:id", getMemberById); // any authenticated user can view details
routerMember.put("/:id", requireRole(["admin"]), updateMember);
routerMember.delete("/:id", requireRole(["admin"]), deleteMember);

module.exports = routerMember;
