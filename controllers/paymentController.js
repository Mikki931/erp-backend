const Payment = require("../models/Payment");
const { sendError } = require("../utils/errorHandler");
const Invoice = require("../models/Invoice");

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("invoiceId");

    res.json({
      error: false,
      payments,
      message: "All payments fetched successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("invoiceId");

    if (!payment) {
      return res.status(404).json({
        error: true,
        message: "Payment not found",
      });
    }

    res.json({
      error: false,
      payment,
      message: "Payment fetched successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Create payment
exports.createPayment = async (req, res) => {
  try {
    const { invoiceId, amount, paymentDate, method } = req.body;

    // Validation
    if (!invoiceId || !amount || !method) {
      return res.status(400).json({
        error: true,
        message: "Invoice ID, amount, and payment method are required",
      });
    }

    // Check if invoice exists
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({
        error: true,
        message: "Invoice not found",
      });
    }

    const payment = await Payment.create({
      invoiceId,
      amount,
      paymentDate: paymentDate || new Date(),
      method,
    });

    // Mark invoice as paid if payment amount covers total
    if (amount >= invoice.totalAmount) {
      await Invoice.findByIdAndUpdate(invoiceId, { paid: true });
    }

    const populatedPayment = await payment.populate("invoiceId");

    res.status(201).json({
      error: false,
      payment: populatedPayment,
      message: "Payment created successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Update payment
exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("invoiceId");

    if (!payment) {
      return res.status(404).json({
        error: true,
        message: "Payment not found",
      });
    }

    res.json({
      error: false,
      payment,
      message: "Payment updated successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({
        error: true,
        message: "Payment not found",
      });
    }

    res.json({
      error: false,
      message: "Payment deleted successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};
