const express = require("express");
const { authMiddleware } = require("../middleware/authmiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getAllBOMs,
  getBOMById,
  createBOM,
  updateBOM,
  deleteBOM,
  manufactureProduct,
} = require("../controllers/bomController");

const routerBOM = express.Router();

routerBOM.use(authMiddleware);

// restrict bom to admin or production roles
routerBOM.get("/", requireRole(["admin", "production"]), getAllBOMs);
routerBOM.get("/:id", requireRole(["admin", "production"]), getBOMById);
routerBOM.post("/", requireRole(["admin", "production"]), createBOM);
routerBOM.put("/:id", requireRole(["admin", "production"]), updateBOM);
routerBOM.delete("/:id", requireRole(["admin", "production"]), deleteBOM);
// manufacture endpoint, only production or admin
routerBOM.post(
  "/manufacture",
  requireRole(["admin", "production"]),
  manufactureProduct,
);

module.exports = routerBOM;
