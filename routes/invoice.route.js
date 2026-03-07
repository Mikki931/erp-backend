const express = require("express");
const { authMiddleware } = require("../middleware/authmiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} = require("../controllers/invoiceController");

const routerInvoice = express.Router();

routerInvoice.use(authMiddleware);

// read access for any authenticated user; write/delete still admin/sales
routerInvoice.get("/", getAllInvoices);
routerInvoice.get("/:id", getInvoiceById);
routerInvoice.post("/", requireRole(["admin", "sales"]), createInvoice);
routerInvoice.put("/:id", requireRole(["admin", "sales"]), updateInvoice);
routerInvoice.delete("/:id", requireRole(["admin", "sales"]), deleteInvoice);

module.exports = routerInvoice;
