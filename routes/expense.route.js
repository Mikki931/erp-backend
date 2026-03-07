const express = require("express");
const { authMiddleware } = require("../middleware/authmiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

const routerExpense = express.Router();

routerExpense.use(authMiddleware);

// read access for any authenticated user; modifications still admin-only
routerExpense.get("/", getAllExpenses);
routerExpense.get("/:id", getExpenseById);
routerExpense.post("/", requireRole(["admin"]), createExpense);
routerExpense.put("/:id", requireRole(["admin"]), updateExpense);
routerExpense.delete("/:id", requireRole(["admin"]), deleteExpense);

module.exports = routerExpense;
