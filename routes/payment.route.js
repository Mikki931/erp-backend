const express = require("express");
const { authMiddleware } = require("../middleware/authmiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} = require("../controllers/paymentController");

const routerPayment = express.Router();

routerPayment.use(authMiddleware);

// read access for any authenticated user; writes still admin-only
routerPayment.get("/", getAllPayments);
routerPayment.get("/:id", getPaymentById);
routerPayment.post("/", requireRole(["admin"]), createPayment);
routerPayment.put("/:id", requireRole(["admin"]), updatePayment);
routerPayment.delete("/:id", requireRole(["admin"]), deletePayment);

module.exports = routerPayment;
