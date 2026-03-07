const express = require("express");
const { authMiddleware } = require("../middleware/authmiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getAllSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateSalesOrder,
  deleteSalesOrder,
  getInvoiceForSalesOrder,
} = require("../controllers/salesOrderController");

const routerSalesOrder = express.Router();

routerSalesOrder.use(authMiddleware);

// read access for any authenticated user; actions still limited to admin/sales
routerSalesOrder.get("/", getAllSalesOrders);
routerSalesOrder.get("/:id", getSalesOrderById);
// return invoice associated with a sales order (used by reports/front-end)
routerSalesOrder.get("/:id/invoice", getInvoiceForSalesOrder);
routerSalesOrder.post("/", requireRole(["admin", "sales"]), createSalesOrder);
routerSalesOrder.put("/:id", requireRole(["admin", "sales"]), updateSalesOrder);
routerSalesOrder.delete(
  "/:id",
  requireRole(["admin", "sales"]),
  deleteSalesOrder,
);

module.exports = routerSalesOrder;
