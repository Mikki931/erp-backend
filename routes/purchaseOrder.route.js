const express = require("express");
const { authMiddleware } = require("../middleware/authmiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
} = require("../controllers/purchaseOrderController");

const routerPurchaseOrder = express.Router();

routerPurchaseOrder.use(authMiddleware);

// read access for any authenticated user; modifications still admin/store
routerPurchaseOrder.get("/", getAllPurchaseOrders);
routerPurchaseOrder.get("/:id", getPurchaseOrderById);
routerPurchaseOrder.post(
  "/",
  requireRole(["admin", "store"]),
  createPurchaseOrder,
);
routerPurchaseOrder.put(
  "/:id",
  requireRole(["admin", "store"]),
  updatePurchaseOrder,
);
routerPurchaseOrder.delete(
  "/:id",
  requireRole(["admin", "store"]),
  deletePurchaseOrder,
);

module.exports = routerPurchaseOrder;
