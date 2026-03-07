const Expense = require("../models/Expense");
const { sendError } = require("../utils/errorHandler");

// Get all expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find();

    // always return an array, even if it's empty — callers expect this
    res.json({
      error: false,
      expenses,
      message: "All expenses fetched successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Get expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        error: true,
        message: "Expense not found",
      });
    }

    res.json({
      error: false,
      expense,
      message: "Expense fetched successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Create expense
exports.createExpense = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    // Validation
    if (!title || !amount || !category) {
      return res.status(400).json({
        error: true,
        message: "Title, amount, and category are required",
      });
    }

    const expense = await Expense.create({
      title,
      amount,
      category,
      date: date || new Date(),
    });

    res.status(201).json({
      error: false,
      expense,
      message: "Expense created successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!expense) {
      return res.status(404).json({
        error: true,
        message: "Expense not found",
      });
    }

    res.json({
      error: false,
      expense,
      message: "Expense updated successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({
        error: true,
        message: "Expense not found",
      });
    }

    res.json({
      error: false,
      message: "Expense deleted successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};
