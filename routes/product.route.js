const express = require("express");
const { authMiddleware } = require("../middleware/authmiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const routerProduct = express.Router();

routerProduct.use(authMiddleware);

// public to authenticated users
routerProduct.get("/", getAllProducts);
routerProduct.get("/:id", getProductById);

// restricted operations
routerProduct.post("/", requireRole(["admin", "production"]), createProduct);
routerProduct.put("/:id", requireRole(["admin", "production"]), updateProduct);
routerProduct.delete(
  "/:id",
  requireRole(["admin", "production"]),
  deleteProduct,
);

module.exports = routerProduct;
